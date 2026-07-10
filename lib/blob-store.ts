import "server-only";
import { get, put } from "@vercel/blob";
import { Client } from "./types";
import { EPOCH_TRIMESTER_ID, shiftTrimesterId, trimesterFromId } from "./trimester";
import { LATE_PRICE } from "./payment";
import { DEFAULT_POSTS } from "./posts";

const BLOB_PATHNAME = "cosmoni/state.json";

export interface ClientProfile {
  id: string;
  name: string;
  post: string;
  phone: string;
  instagram: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  paid: boolean;
  paidAt: string | null;
  /** DT owed from trimesters missed before this one, stacked on top of this trimester's own fee. */
  carriedOver: number;
  updatedAt: string;
}

/** Server-only shape: client profiles are trimester-independent; payment status is logged per trimester. */
export interface RawAppState {
  activeTrimesterId: string;
  latestTrimesterId: string;
  clients: ClientProfile[];
  posts: string[];
  trimesters: Record<string, Record<string, PaymentRecord>>;
}

function defaultState(): RawAppState {
  return {
    activeTrimesterId: EPOCH_TRIMESTER_ID,
    latestTrimesterId: EPOCH_TRIMESTER_ID,
    clients: [],
    posts: DEFAULT_POSTS,
    trimesters: { [EPOCH_TRIMESTER_ID]: {} },
  };
}

/** True if `data` at least resembles a Cosmoni backup (current or legacy shape). */
export function looksLikeBackup(data: unknown): boolean {
  if (Array.isArray(data)) return true; // legacy flat clients array
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return Array.isArray(obj.clients) || typeof obj.trimesters === "object";
}

export function normalize(data: unknown): RawAppState {
  if (!data || typeof data !== "object") return defaultState();

  // Legacy shape from before the trimester system existed: a bare array of clients.
  if (Array.isArray(data)) {
    return migrateFlatClients(data as Record<string, unknown>[], EPOCH_TRIMESTER_ID);
  }

  const legacy = data as { trimesters?: unknown; activeTrimesterId?: string; clients?: Record<string, unknown>[] };

  // Legacy shape from the single-trimester system: { activeTrimesterId, clients: Client[], posts }.
  if (!legacy.trimesters) {
    const id = legacy.activeTrimesterId ?? EPOCH_TRIMESTER_ID;
    return migrateFlatClients(legacy.clients ?? [], id, (data as { posts?: string[] }).posts);
  }

  const state = data as Partial<RawAppState>;
  const latestTrimesterId = state.latestTrimesterId ?? state.activeTrimesterId ?? EPOCH_TRIMESTER_ID;
  return {
    activeTrimesterId: state.activeTrimesterId ?? latestTrimesterId,
    latestTrimesterId,
    clients: state.clients ?? [],
    posts: state.posts ?? DEFAULT_POSTS,
    trimesters: state.trimesters ?? { [latestTrimesterId]: {} },
  };
}

function migrateFlatClients(
  flatClients: Record<string, unknown>[],
  trimesterId: string,
  posts?: string[]
): RawAppState {
  const clients: ClientProfile[] = [];
  const records: Record<string, PaymentRecord> = {};
  for (const c of flatClients) {
    const id = c.id as string;
    clients.push({
      id,
      name: c.name as string,
      post: (c.post as string) ?? "",
      phone: (c.phone as string) ?? "",
      instagram: (c.instagram as string) ?? "",
      createdAt: c.createdAt as string,
      updatedAt: c.updatedAt as string,
    });
    records[id] = {
      paid: Boolean(c.paid),
      paidAt: (c.paidAt as string) ?? null,
      carriedOver: (c.carriedOver as number) ?? 0,
      updatedAt: c.updatedAt as string,
    };
  }
  return {
    activeTrimesterId: trimesterId,
    latestTrimesterId: trimesterId,
    clients,
    posts: posts ?? DEFAULT_POSTS,
    trimesters: { [trimesterId]: records },
  };
}

export async function readRawState(): Promise<RawAppState> {
  const result = await get(BLOB_PATHNAME, { access: "private", useCache: false });
  if (!result?.stream) return defaultState();

  const data = await new Response(result.stream).json();
  return normalize(data);
}

export async function writeRawState(state: RawAppState): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(state), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

/** Builds the UI-facing client list for a given trimester — only clients who existed by then. */
export function mergeForTrimester(state: RawAppState, trimesterId: string): Client[] {
  const records = state.trimesters[trimesterId] ?? {};
  const trimesterStart = trimesterFromId(trimesterId).start.toISOString();
  return state.clients
    .filter((profile) => records[profile.id])
    .map((profile) => {
      const record = records[profile.id];
      return {
        ...profile,
        trimesterStart,
        paid: record.paid,
        paidAt: record.paidAt,
        carriedOver: record.carriedOver,
      };
    });
}

/**
 * Advances the ledger from `state.latestTrimesterId` to `targetId`, one trimester at a time.
 * Anyone still unpaid when a trimester closes carries a flat late fee forward, stacking with
 * whatever they already owed. Mutates `state` in place; caller persists it.
 */
export function advanceLedger(state: RawAppState, targetId: string, now: string): void {
  let cursor = state.latestTrimesterId;
  let guard = 0;
  while (cursor !== targetId && guard < 200) {
    const next = shiftTrimesterId(cursor, 1);
    const closing = state.trimesters[cursor] ?? {};
    const nextRecords: Record<string, PaymentRecord> = {};
    for (const client of state.clients) {
      const prev = closing[client.id];
      if (!prev) continue; // client didn't exist as of this trimester — don't backfill them into it
      nextRecords[client.id] = {
        paid: false,
        paidAt: null,
        carriedOver: prev.paid ? 0 : prev.carriedOver + LATE_PRICE,
        updatedAt: now,
      };
    }
    state.trimesters[next] = nextRecords;
    cursor = next;
    guard += 1;
  }
  state.latestTrimesterId = cursor;
  state.activeTrimesterId = cursor;
}

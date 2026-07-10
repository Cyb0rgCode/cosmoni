"use client";

import { useSyncExternalStore } from "react";
import { AppState, Client, ClientInput } from "./types";

let clients: Client[] = [];
let activeTrimesterId = "";
let latestTrimesterId = "";
let posts: string[] = [];
let loaded = false;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Request failed");
  }

  return res.status === 204 ? null : res.json();
}

function applyState(state: AppState) {
  clients = state.clients;
  activeTrimesterId = state.activeTrimesterId;
  latestTrimesterId = state.latestTrimesterId;
  posts = state.posts;
}

function fetchState(): Promise<void> {
  if (!inFlight) {
    inFlight = api("/api/state")
      .then((data) => {
        applyState(data as AppState);
        loaded = true;
        emit();
      })
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) fetchState();
  return () => listeners.delete(listener);
}

function getSnapshot(): Client[] {
  return clients;
}

function getServerSnapshot(): Client[] {
  return [];
}

function getLoaded(): boolean {
  return loaded;
}

function getActiveTrimesterId(): string {
  return activeTrimesterId;
}

function getLatestTrimesterId(): string {
  return latestTrimesterId;
}

function getPosts(): string[] {
  return posts;
}

export function useClients(): Client[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useClientsLoaded(): boolean {
  return useSyncExternalStore(subscribe, getLoaded, () => false);
}

export function useActiveTrimesterId(): string {
  return useSyncExternalStore(subscribe, getActiveTrimesterId, () => "");
}

export function useLatestTrimesterId(): string {
  return useSyncExternalStore(subscribe, getLatestTrimesterId, () => "");
}

/** True once loaded and the user is viewing an earlier trimester rather than the current one. */
export function useIsViewingHistory(): boolean {
  const active = useActiveTrimesterId();
  const latest = useLatestTrimesterId();
  return Boolean(active && latest && active !== latest);
}

const EMPTY_POSTS: string[] = [];

export function usePosts(): string[] {
  return useSyncExternalStore(subscribe, getPosts, () => EMPTY_POSTS);
}

export async function addClient(input: ClientInput): Promise<Client> {
  const client = (await api("/api/clients", {
    method: "POST",
    body: JSON.stringify(input),
  })) as Client;
  // New clients always land in the latest trimester; only splice into the visible
  // list if that's what's currently being viewed.
  if (activeTrimesterId === latestTrimesterId) {
    clients = [client, ...clients];
    emit();
  }
  return client;
}

/** Edits a client's profile fields (name, post, phone, instagram) — shared across all trimesters. */
export async function updateClient(id: string, input: ClientInput): Promise<void> {
  const updated = (await api(`/api/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ profile: input }),
  })) as Client;
  clients = clients.map((c) => (c.id === id ? updated : c));
  emit();
}

export async function deleteClient(id: string): Promise<void> {
  await api(`/api/clients/${id}`, { method: "DELETE" });
  clients = clients.filter((c) => c.id !== id);
  emit();
}

async function updatePayment(
  id: string,
  payment: { paid?: boolean; paidAt?: string | null; carriedOver?: number }
): Promise<void> {
  const updated = (await api(`/api/clients/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ trimesterId: activeTrimesterId, payment }),
  })) as Client;
  clients = clients.map((c) => (c.id === id ? updated : c));
  emit();
}

export function markPaid(id: string): Promise<void> {
  return updatePayment(id, { paid: true, paidAt: new Date().toISOString(), carriedOver: 0 });
}

export function markUnpaid(id: string): Promise<void> {
  return updatePayment(id, { paid: false, paidAt: null });
}

export async function addPost(name: string): Promise<void> {
  const result = (await api("/api/posts", {
    method: "POST",
    body: JSON.stringify({ name }),
  })) as { posts: string[] };
  posts = result.posts;
  emit();
}

export async function deletePost(name: string): Promise<void> {
  const result = (await api("/api/posts", {
    method: "DELETE",
    body: JSON.stringify({ name }),
  })) as { posts: string[] };
  posts = result.posts;
  emit();
}

/**
 * Switches which trimester is being viewed. If it's already recorded, this is a pure
 * view change — nothing is recalculated. If it's beyond the latest trimester, unpaid
 * clients carry a flat late fee forward as the ledger advances to it.
 */
export async function switchTrimester(trimesterId: string): Promise<void> {
  const state = (await api("/api/trimester", {
    method: "POST",
    body: JSON.stringify({ trimesterId }),
  })) as AppState;
  applyState(state);
  emit();
}

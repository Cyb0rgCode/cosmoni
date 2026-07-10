import "server-only";
import { get, put } from "@vercel/blob";
import { AppState, Client } from "./types";
import { currentTrimesterId } from "./trimester";
import { DEFAULT_POSTS } from "./posts";

const BLOB_PATHNAME = "cosmoni/state.json";

function normalize(data: unknown): AppState {
  // Legacy shape: a bare array of clients, from before the trimester system existed.
  if (Array.isArray(data)) {
    return { activeTrimesterId: currentTrimesterId(), clients: data as Client[], posts: DEFAULT_POSTS };
  }
  const state = data as Partial<AppState>;
  return {
    activeTrimesterId: state.activeTrimesterId ?? currentTrimesterId(),
    clients: state.clients ?? [],
    posts: state.posts ?? DEFAULT_POSTS,
  };
}

export async function readState(): Promise<AppState> {
  const result = await get(BLOB_PATHNAME, { access: "private", useCache: false });
  if (!result?.stream) {
    return { activeTrimesterId: currentTrimesterId(), clients: [], posts: DEFAULT_POSTS };
  }

  const data = await new Response(result.stream).json();
  return normalize(data);
}

export async function writeState(state: AppState): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(state), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

import "server-only";
import { list, put } from "@vercel/blob";
import { Client } from "./types";

const BLOB_PATHNAME = "cosmoni/clients.json";

export async function readClients(): Promise<Client[]> {
  const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
  const blob = blobs[0];
  if (!blob) return [];

  const res = await fetch(blob.url, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as Client[];
}

export async function writeClients(clients: Client[]): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(clients), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

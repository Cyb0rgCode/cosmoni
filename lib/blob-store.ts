import "server-only";
import { get, put } from "@vercel/blob";
import { Client } from "./types";

const BLOB_PATHNAME = "cosmoni/clients.json";

export async function readClients(): Promise<Client[]> {
  const result = await get(BLOB_PATHNAME, { access: "private", useCache: false });
  if (!result?.stream) return [];

  return (await new Response(result.stream).json()) as Client[];
}

export async function writeClients(clients: Client[]): Promise<void> {
  await put(BLOB_PATHNAME, JSON.stringify(clients), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

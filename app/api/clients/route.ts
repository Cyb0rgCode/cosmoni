import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { readState, writeState } from "@/lib/blob-store";
import { trimesterFromId } from "@/lib/trimester";
import { Client, ClientInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  const input = (await request.json().catch(() => null)) as Partial<ClientInput> | null;

  if (!input?.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const state = await readState();
  const now = new Date().toISOString();
  const client: Client = {
    id: randomUUID(),
    name: input.name.trim(),
    post: input.post?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
    instagram: (input.instagram ?? "").trim().replace(/^@/, ""),
    trimesterStart: trimesterFromId(state.activeTrimesterId).start.toISOString(),
    paid: false,
    paidAt: null,
    carriedOver: 0,
    createdAt: now,
    updatedAt: now,
  };

  state.clients = [client, ...state.clients];
  await writeState(state);
  return NextResponse.json(client, { status: 201 });
}

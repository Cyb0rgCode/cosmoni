import { NextRequest, NextResponse } from "next/server";
import { readState, writeState } from "@/lib/blob-store";
import { Client } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const patch = (await request.json().catch(() => null)) as Partial<Client> | null;
  if (!patch) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const state = await readState();
  const index = state.clients.findIndex((c) => c.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated: Client = {
    ...state.clients[index],
    ...patch,
    id: state.clients[index].id,
    createdAt: state.clients[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  state.clients[index] = updated;
  await writeState(state);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const state = await readState();
  const filtered = state.clients.filter((c) => c.id !== id);
  if (filtered.length === state.clients.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  state.clients = filtered;
  await writeState(state);
  return NextResponse.json({ ok: true });
}

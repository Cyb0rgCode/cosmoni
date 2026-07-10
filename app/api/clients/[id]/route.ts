import { NextRequest, NextResponse } from "next/server";
import { readClients, writeClients } from "@/lib/blob-store";
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

  const clients = await readClients();
  const index = clients.findIndex((c) => c.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated: Client = {
    ...clients[index],
    ...patch,
    id: clients[index].id,
    createdAt: clients[index].createdAt,
    updatedAt: new Date().toISOString(),
  };
  clients[index] = updated;
  await writeClients(clients);
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const clients = await readClients();
  const filtered = clients.filter((c) => c.id !== id);
  if (filtered.length === clients.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await writeClients(filtered);
  return NextResponse.json({ ok: true });
}

import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { readClients, writeClients } from "@/lib/blob-store";
import { Client, ClientInput } from "@/lib/types";

export async function GET() {
  const clients = await readClients();
  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  const input = (await request.json().catch(() => null)) as Partial<ClientInput> | null;

  if (!input?.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const clients = await readClients();
  const now = new Date().toISOString();
  const client: Client = {
    id: randomUUID(),
    name: input.name.trim(),
    post: input.post?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
    instagram: (input.instagram ?? "").trim().replace(/^@/, ""),
    trimesterStart: now,
    paid: false,
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await writeClients([client, ...clients]);
  return NextResponse.json(client, { status: 201 });
}

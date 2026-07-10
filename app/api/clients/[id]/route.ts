import { NextRequest, NextResponse } from "next/server";
import { readRawState, writeRawState, mergeForTrimester } from "@/lib/blob-store";

interface PatchBody {
  /** Which trimester's payment record to update. Defaults to the currently active one. */
  trimesterId?: string;
  profile?: { name?: string; post?: string; phone?: string; instagram?: string };
  payment?: { paid?: boolean; paidAt?: string | null; carriedOver?: number };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => null)) as PatchBody | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const state = await readRawState();
  const index = state.clients.findIndex((c) => c.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date().toISOString();

  if (body.profile) {
    const current = state.clients[index];
    state.clients[index] = {
      ...current,
      ...(body.profile.name !== undefined && { name: body.profile.name.trim() }),
      ...(body.profile.post !== undefined && { post: body.profile.post.trim() }),
      ...(body.profile.phone !== undefined && { phone: body.profile.phone.trim() }),
      ...(body.profile.instagram !== undefined && {
        instagram: body.profile.instagram.trim().replace(/^@/, ""),
      }),
      updatedAt: now,
    };
  }

  const trimesterId = body.trimesterId ?? state.activeTrimesterId;

  if (body.payment) {
    const records = state.trimesters[trimesterId] ?? {};
    const existing = records[id] ?? { paid: false, paidAt: null, carriedOver: 0, updatedAt: now };
    state.trimesters[trimesterId] = {
      ...records,
      [id]: { ...existing, ...body.payment, updatedAt: now },
    };
  }

  await writeRawState(state);

  const merged = mergeForTrimester(state, trimesterId).find((c) => c.id === id);
  if (!merged) {
    return NextResponse.json({ error: "Client has no record in that trimester" }, { status: 404 });
  }
  return NextResponse.json(merged);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const state = await readRawState();

  const before = state.clients.length;
  state.clients = state.clients.filter((c) => c.id !== id);
  if (state.clients.length === before) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  for (const trimesterId of Object.keys(state.trimesters)) {
    if (id in state.trimesters[trimesterId]) {
      const records = { ...state.trimesters[trimesterId] };
      delete records[id];
      state.trimesters[trimesterId] = records;
    }
  }

  await writeRawState(state);
  return NextResponse.json({ ok: true });
}

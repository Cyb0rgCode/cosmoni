import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { readRawState, writeRawState, mergeForTrimester } from "@/lib/blob-store";
import { ClientInput } from "@/lib/types";

export async function POST(request: NextRequest) {
  const input = (await request.json().catch(() => null)) as Partial<ClientInput> | null;

  if (!input?.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const state = await readRawState();
  const now = new Date().toISOString();
  const id = randomUUID();

  state.clients = [
    {
      id,
      name: input.name.trim(),
      post: input.post?.trim() ?? "",
      phone: input.phone?.trim() ?? "",
      instagram: (input.instagram ?? "").trim().replace(/^@/, ""),
      createdAt: now,
      updatedAt: now,
    },
    ...state.clients,
  ];

  const latest = state.latestTrimesterId;
  state.trimesters[latest] = {
    ...(state.trimesters[latest] ?? {}),
    [id]: { paid: false, paidAt: null, carriedOver: 0, updatedAt: now },
  };

  await writeRawState(state);

  const merged = mergeForTrimester(state, latest).find((c) => c.id === id)!;
  return NextResponse.json(merged, { status: 201 });
}

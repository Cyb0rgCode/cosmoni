import { NextRequest, NextResponse } from "next/server";
import { readState, writeState } from "@/lib/blob-store";
import { isValidTrimesterId, trimesterFromId } from "@/lib/trimester";
import { amountDue } from "@/lib/payment";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { trimesterId?: string } | null;
  const trimesterId = body?.trimesterId;

  if (!trimesterId || !isValidTrimesterId(trimesterId)) {
    return NextResponse.json({ error: "Invalid trimester id" }, { status: 400 });
  }

  const state = await readState();
  if (trimesterId === state.activeTrimesterId) {
    return NextResponse.json(state);
  }

  const newStart = trimesterFromId(trimesterId).start.toISOString();
  const now = new Date().toISOString();

  // Clients who stayed unpaid carry their full owed amount (fee + any prior carry-over)
  // into the new trimester, stacking on top of whatever that new trimester charges.
  state.clients = state.clients.map((client) => ({
    ...client,
    trimesterStart: newStart,
    paid: false,
    paidAt: null,
    carriedOver: client.paid ? 0 : amountDue(client),
    updatedAt: now,
  }));
  state.activeTrimesterId = trimesterId;

  await writeState(state);
  return NextResponse.json(state);
}

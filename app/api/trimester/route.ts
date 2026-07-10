import { NextRequest, NextResponse } from "next/server";
import { readRawState, writeRawState, mergeForTrimester, advanceLedger } from "@/lib/blob-store";
import { currentTrimesterId, isValidTrimesterId } from "@/lib/trimester";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { trimesterId?: string } | null;
  const trimesterId = body?.trimesterId;

  if (!trimesterId || !isValidTrimesterId(trimesterId)) {
    return NextResponse.json({ error: "Invalid trimester id" }, { status: 400 });
  }

  const state = await readRawState();

  if (state.trimesters[trimesterId]) {
    // Already recorded — this is a pure view switch. Nothing is recalculated or overwritten.
    state.activeTrimesterId = trimesterId;
  } else if (trimesterId < state.latestTrimesterId) {
    return NextResponse.json(
      { error: "This trimester is before the tracked history and can't be created" },
      { status: 400 }
    );
  } else {
    advanceLedger(state, trimesterId, new Date().toISOString());
  }

  await writeRawState(state);

  return NextResponse.json({
    activeTrimesterId: state.activeTrimesterId,
    latestTrimesterId: state.latestTrimesterId,
    todayTrimesterId: currentTrimesterId(),
    posts: state.posts,
    clients: mergeForTrimester(state, state.activeTrimesterId),
  });
}

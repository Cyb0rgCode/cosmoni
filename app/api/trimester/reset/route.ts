import { NextResponse } from "next/server";
import { readRawState, writeRawState, mergeForTrimester, resetToToday } from "@/lib/blob-store";
import { currentTrimesterId } from "@/lib/trimester";

export async function POST() {
  const state = await readRawState();
  const today = currentTrimesterId();

  resetToToday(state, today, new Date().toISOString());
  await writeRawState(state);

  return NextResponse.json({
    activeTrimesterId: state.activeTrimesterId,
    latestTrimesterId: state.latestTrimesterId,
    todayTrimesterId: today,
    posts: state.posts,
    clients: mergeForTrimester(state, state.activeTrimesterId),
  });
}

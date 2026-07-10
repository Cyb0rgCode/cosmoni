import { NextResponse } from "next/server";
import { readRawState, mergeForTrimester } from "@/lib/blob-store";
import { currentTrimesterId } from "@/lib/trimester";

export async function GET() {
  const state = await readRawState();
  return NextResponse.json({
    activeTrimesterId: state.activeTrimesterId,
    latestTrimesterId: state.latestTrimesterId,
    todayTrimesterId: currentTrimesterId(),
    posts: state.posts,
    clients: mergeForTrimester(state, state.activeTrimesterId),
  });
}

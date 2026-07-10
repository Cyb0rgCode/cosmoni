import { NextResponse } from "next/server";
import { readRawState, mergeForTrimester } from "@/lib/blob-store";

export async function GET() {
  const state = await readRawState();
  return NextResponse.json({
    activeTrimesterId: state.activeTrimesterId,
    latestTrimesterId: state.latestTrimesterId,
    posts: state.posts,
    clients: mergeForTrimester(state, state.activeTrimesterId),
  });
}

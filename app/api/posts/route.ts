import { NextRequest, NextResponse } from "next/server";
import { readState, writeState } from "@/lib/blob-store";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = body?.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Post name is required" }, { status: 400 });
  }

  const state = await readState();
  if (!state.posts.some((p) => p.toLowerCase() === name.toLowerCase())) {
    state.posts = [...state.posts, name];
    await writeState(state);
  }

  return NextResponse.json({ posts: state.posts });
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = body?.name;

  if (!name) {
    return NextResponse.json({ error: "Post name is required" }, { status: 400 });
  }

  const state = await readState();
  state.posts = state.posts.filter((p) => p !== name);
  await writeState(state);

  return NextResponse.json({ posts: state.posts });
}

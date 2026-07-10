import { NextRequest, NextResponse } from "next/server";
import { writeRawState, normalize, looksLikeBackup } from "@/lib/blob-store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!looksLikeBackup(body)) {
    return NextResponse.json(
      { error: "This doesn't look like a Cosmoni backup file" },
      { status: 400 }
    );
  }

  const state = normalize(body);
  await writeRawState(state);

  return NextResponse.json({ ok: true });
}

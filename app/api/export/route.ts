import { NextResponse } from "next/server";
import { readRawState } from "@/lib/blob-store";

export async function GET() {
  const state = await readRawState();
  const filename = `cosmoni-backup-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(state, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

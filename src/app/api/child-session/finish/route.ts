import { NextResponse } from "next/server";
import { readChild } from "@/server/auth";
import { finishSession } from "@/server/learning";

export const runtime = "nodejs";

export async function POST() {
  const child = await readChild();
  if (!child) return NextResponse.json({ error: "No child session." }, { status: 401 });
  await finishSession(child.sessionId);
  return NextResponse.json({ ok: true, mode: "done" });
}

import { NextResponse } from "next/server";
import { readChild } from "@/server/auth";
import { currentQuestion, LearningError } from "@/server/learning";

export const runtime = "nodejs";

export async function GET() {
  const child = await readChild();
  if (!child) return NextResponse.json({ error: "No child session." }, { status: 401 });
  try {
    const question = await currentQuestion(child.sessionId);
    return NextResponse.json(question);
  } catch (error) {
    const message = error instanceof LearningError ? error.message : "Could not load the session.";
    const status = error instanceof LearningError ? error.status : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

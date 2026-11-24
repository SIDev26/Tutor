import { NextResponse } from "next/server";
import { readChild } from "@/server/auth";
import { answerAttempt, LearningError } from "@/server/learning";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const child = await readChild();
  if (!child) return NextResponse.json({ error: "No child session." }, { status: 401 });
  const body = (await request.json()) as { attemptId?: string; choiceId?: string; responseMs?: number };
  if (!body.attemptId || !body.choiceId) {
    return NextResponse.json({ error: "Choose an answer." }, { status: 400 });
  }
  try {
    const feedback = await answerAttempt({
      sessionId: child.sessionId,
      attemptId: body.attemptId,
      choiceId: body.choiceId,
      responseMs: body.responseMs,
    });
    return NextResponse.json(feedback);
  } catch (error) {
    const message = error instanceof LearningError ? error.message : "Could not save the answer.";
    const status = error instanceof LearningError ? error.status : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

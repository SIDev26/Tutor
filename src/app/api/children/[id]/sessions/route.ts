import { prisma } from "@/server/db";
import { asString, readBody, wantsJson } from "@/server/http";
import { readParent, attachChildCookie } from "@/server/auth";
import { startLearningSession, LearningError } from "@/server/learning";
import { signChildToken } from "@/lib/tokens";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parent = await readParent();
  const { id } = await context.params;
  if (!parent) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const child = await prisma.child.findFirst({ where: { id, parentId: parent.sub } });
  if (!child) return NextResponse.json({ error: "Child not found." }, { status: 404 });
  const body = await readBody(request);
  const kind = asString(body.kind);
  if (kind !== "DIAGNOSTIC" && kind !== "PRACTICE") {
    return NextResponse.json({ error: "Choose diagnostic or practice." }, { status: 400 });
  }
  try {
    const started = await startLearningSession(child.id, kind);
    const token = await signChildToken({
      childId: child.id,
      sessionId: started.session.id,
      parentId: parent.sub,
      nickname: child.nickname,
      grade: child.grade,
    });
    const response = wantsJson(request)
      ? NextResponse.json({ ok: true, redirect: "/child", sessionId: started.session.id })
      : NextResponse.redirect(new URL("/child", request.url), 303);
    return attachChildCookie(response, token);
  } catch (error) {
    const message = error instanceof LearningError ? error.message : "Could not start the session.";
    const status = error instanceof LearningError ? error.status : 400;
    if (wantsJson(request)) return NextResponse.json({ error: message }, { status });
    return NextResponse.redirect(
      new URL(`/parent/children/${id}/plan?error=${encodeURIComponent(message)}`, request.url),
      303,
    );
  }
}

import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { asString, readBody, reply, wantsJson } from "@/server/http";
import { attachParentCookie, readChild } from "@/server/auth";
import { finishSession } from "@/server/learning";
import { signParentToken } from "@/lib/tokens";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const child = await readChild();
  if (!child) return reply(request, "/login", { error: "No child session." }, 401);
  const body = await readBody(request);
  const password = asString(body.password);
  const parent = await prisma.user.findUnique({ where: { id: child.parentId } });
  const valid = parent ? await bcrypt.compare(password, parent.passwordHash) : false;
  if (!parent || !valid) {
    if (wantsJson(request)) return NextResponse.json({ error: "Password does not match." }, { status: 401 });
    return NextResponse.redirect(new URL("/child/unlock?error=Password+does+not+match.", request.url), 303);
  }
  await finishSession(child.sessionId);
  const token = await signParentToken({
    sub: parent.id,
    role: parent.role === "ADMIN" ? "ADMIN" : "PARENT",
    name: parent.name,
    email: parent.email,
  });
  const path = `/parent/children/${child.childId}`;
  const response = reply(request, path, { ok: true, redirect: path });
  return attachParentCookie(response, token);
}

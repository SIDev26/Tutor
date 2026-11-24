import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { asString, readBody, reply } from "@/server/http";
import { attachParentCookie, readChild } from "@/server/auth";
import { signParentToken } from "@/lib/tokens";
import { finishSession } from "@/server/learning";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readBody(request);
  const email = asString(body.email).trim().toLowerCase();
  const password = asString(body.password);
  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) {
    return reply(request, "/login?error=Email+or+password+does+not+match.", { error: "Email or password does not match." }, 401);
  }
  const child = await readChild();
  if (child) await finishSession(child.sessionId);
  const token = await signParentToken({
    sub: user.id,
    role: user.role === "ADMIN" ? "ADMIN" : "PARENT",
    name: user.name,
    email: user.email,
  });
  const destination = user.role === "ADMIN" ? "/admin" : "/parent";
  const response = reply(request, destination, { ok: true, redirect: destination });
  return attachParentCookie(response, token);
}

import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { asString, readBody, reply } from "@/server/http";
import { attachParentCookie } from "@/server/auth";
import { signParentToken } from "@/lib/tokens";
import { emailSchema, nameSchema, passwordSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readBody(request);
  const email = emailSchema.safeParse(asString(body.email).toLowerCase());
  const password = passwordSchema.safeParse(asString(body.password));
  const name = nameSchema.safeParse(asString(body.name));
  if (!email.success || !password.success || !name.success) {
    return reply(request, "/register?error=Check+your+name,+email,+and+password+(8+characters+or+more).", { error: "Check your name, email, and password." }, 400);
  }
  const existing = await prisma.user.findUnique({ where: { email: email.data } });
  if (existing) {
    return reply(request, "/register?error=That+email+already+has+an+account.", { error: "That email already has an account." }, 409);
  }
  const user = await prisma.user.create({
    data: {
      email: email.data,
      name: name.data,
      passwordHash: await bcrypt.hash(password.data, 10),
      role: "PARENT",
    },
  });
  const token = await signParentToken({
    sub: user.id,
    role: "PARENT",
    name: user.name,
    email: user.email,
  });
  const response = reply(request, "/parent", { ok: true, redirect: "/parent" });
  return attachParentCookie(response, token);
}

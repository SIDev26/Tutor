import { prisma } from "@/server/db";
import { asString, readBody, reply } from "@/server/http";
import { readParent } from "@/server/auth";
import { gradeSchema, nicknameSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parent = await readParent();
  if (!parent || parent.role === "ADMIN") {
    return reply(request, "/login", { error: "Sign in as a parent." }, 401);
  }
  const body = await readBody(request);
  const nickname = nicknameSchema.safeParse(asString(body.nickname));
  const grade = gradeSchema.safeParse(asString(body.grade));
  if (!nickname.success || !grade.success) {
    return reply(
      request,
      "/parent/children/new?error=Use+a+first+name+or+nickname+and+grade+2,+3,+or+4.",
      { error: "Use a first name or nickname and grade 2, 3, or 4." },
      400,
    );
  }
  const child = await prisma.child.create({
    data: { parentId: parent.sub, nickname: nickname.data, grade: grade.data, dailyMinutes: 15 },
  });
  return reply(request, `/parent/children/${child.id}`, { ok: true, childId: child.id });
}

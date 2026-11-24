import { prisma } from "@/server/db";
import { asString, readBody, reply } from "@/server/http";
import { readParent } from "@/server/auth";
import { markAlertsRead } from "@/server/learning";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parent = await readParent();
  const { id } = await context.params;
  if (!parent) return reply(request, "/login", { error: "Sign in required." }, 401);
  const child = await prisma.child.findFirst({ where: { id, parentId: parent.sub } });
  if (!child) return reply(request, "/parent", { error: "Child not found." }, 404);
  const body = await readBody(request);
  await markAlertsRead(id, asString(body.alertId) || undefined);
  return reply(request, `/parent/children/${id}`, { ok: true });
}

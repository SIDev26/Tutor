import { prisma } from "@/server/db";
import { asString, asStrings, readBody, reply } from "@/server/http";
import { readParent } from "@/server/auth";
import { approvePlan, LearningError, refreshProposal } from "@/server/learning";
import { minutesSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parent = await readParent();
  const { id } = await context.params;
  if (!parent) return reply(request, "/login", { error: "Sign in required." }, 401);
  const child = await prisma.child.findFirst({ where: { id, parentId: parent.sub } });
  if (!child) return reply(request, "/parent", { error: "Child not found." }, 404);
  const body = await readBody(request);
  const intent = asString(body.intent);
  try {
    if (intent === "propose") {
      await refreshProposal(id);
      return reply(request, `/parent/children/${id}/plan`, { ok: true });
    }
    const minutes = minutesSchema.safeParse(asString(body.dailyMinutes) || String(child.dailyMinutes));
    if (!minutes.success) {
      throw new LearningError("Choose 10, 15, or 20 minutes.");
    }
    await approvePlan(id, asStrings(body.skillIds), asString(body.parentNote).slice(0, 500), minutes.data);
    return reply(request, `/parent/children/${id}?approved=1`, { ok: true, redirect: `/parent/children/${id}` });
  } catch (error) {
    const message = error instanceof LearningError ? error.message : "Could not save the plan.";
    return reply(request, `/parent/children/${id}/plan?error=${encodeURIComponent(message)}`, { error: message }, 400);
  }
}

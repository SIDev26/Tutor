import { prisma } from "@/server/db";
import { asString, readBody, reply } from "@/server/http";
import { readParent } from "@/server/auth";
import { minutesSchema } from "@/lib/validators";
import { deleteChildRecords } from "@/server/learning";

export const runtime = "nodejs";

async function owned(parentId: string, childId: string) {
  return prisma.child.findFirst({ where: { id: childId, parentId } });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parent = await readParent();
  const { id } = await context.params;
  if (!parent) return reply(request, "/login", { error: "Sign in required." }, 401);
  const child = await owned(parent.sub, id);
  if (!child) return reply(request, "/parent", { error: "Child not found." }, 404);
  const body = await readBody(request);
  const intent = asString(body.intent);

  if (intent === "minutes") {
    const minutes = minutesSchema.safeParse(asString(body.dailyMinutes));
    if (!minutes.success) {
      return reply(request, `/parent/children/${id}?error=Choose+10,+15,+or+20+minutes.`, { error: "Choose 10, 15, or 20 minutes." }, 400);
    }
    await prisma.child.update({ where: { id }, data: { dailyMinutes: minutes.data } });
    return reply(request, `/parent/children/${id}`, { ok: true });
  }

  if (intent === "delete") {
    if (asString(body.confirm).trim() !== child.nickname) {
      return reply(
        request,
        `/parent/children/${id}?error=Type+the+nickname+exactly+to+delete+the+record.`,
        { error: "Type the nickname exactly to delete the record." },
        400,
      );
    }
    await deleteChildRecords(id);
    return reply(request, "/parent?deleted=1", { ok: true });
  }

  return reply(request, `/parent/children/${id}`, { error: "Unknown action." }, 400);
}

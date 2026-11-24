import { reply } from "@/server/http";
import { clearAuthCookies, readChild } from "@/server/auth";
import { finishSession } from "@/server/learning";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const child = await readChild();
  if (child) await finishSession(child.sessionId);
  const response = reply(request, "/", { ok: true });
  return clearAuthCookies(response);
}

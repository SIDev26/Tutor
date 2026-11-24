import { NextResponse } from "next/server";

export type Body = Record<string, string | string[]>;

export async function readBody(request: Request): Promise<Body> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>;
    const body: Body = {};
    for (const [key, value] of Object.entries(json ?? {})) {
      if (typeof value === "string" || typeof value === "number") body[key] = String(value);
      else if (Array.isArray(value)) body[key] = value.map((item) => String(item));
    }
    return body;
  }
  const form = await request.formData();
  const body: Body = {};
  for (const [key, value] of form.entries()) {
    if (typeof value !== "string") continue;
    const current = body[key];
    if (current === undefined) body[key] = value;
    else if (Array.isArray(current)) current.push(value);
    else body[key] = [current, value];
  }
  return body;
}

export function asString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export function asStrings(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function wantsJson(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  const accept = request.headers.get("accept") ?? "";
  return contentType.includes("application/json") || accept.includes("application/json");
}

export function reply(request: Request, path: string, data: unknown, status = 200) {
  if (wantsJson(request)) return NextResponse.json(data, { status });
  return NextResponse.redirect(new URL(path, request.url), 303);
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CHILD_COOKIE, PARENT_COOKIE, cookieOptions, verifyChildToken, verifyParentToken, type ChildClaims, type ParentClaims } from "@/lib/tokens";

export async function readParent(): Promise<ParentClaims | null> {
  const jar = await cookies();
  return verifyParentToken(jar.get(PARENT_COOKIE)?.value);
}

export async function readChild(): Promise<ChildClaims | null> {
  const jar = await cookies();
  return verifyChildToken(jar.get(CHILD_COOKIE)?.value);
}

export function attachParentCookie(response: NextResponse, token: string) {
  response.cookies.set(PARENT_COOKIE, token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 14 });
  response.cookies.set(CHILD_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return response;
}

export function attachChildCookie(response: NextResponse, token: string) {
  response.cookies.set(CHILD_COOKIE, token, { ...cookieOptions, maxAge: 60 * 60 * 12 });
  response.cookies.set(PARENT_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return response;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(PARENT_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set(CHILD_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return response;
}

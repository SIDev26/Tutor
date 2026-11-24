import { jwtVerify, SignJWT } from "jose";

export const PARENT_COOKIE = "beacon_parent";
export const CHILD_COOKIE = "beacon_child";

export type ParentClaims = {
  sub: string;
  role: "PARENT" | "ADMIN";
  name: string;
  email: string;
};

export type ChildClaims = {
  childId: string;
  sessionId: string;
  parentId: string;
  nickname: string;
  grade: number;
};

/**
 * Production refuses to boot without a long JWT secret.
 * Development still requires a secret, with a shorter minimum.
 */
export function assertJwtSecret(
  env: { NODE_ENV?: string; JWT_SECRET?: string } = process.env,
): string {
  const value = env.JWT_SECRET ?? "";
  if (env.NODE_ENV === "production") {
    if (!value) {
      throw new Error(
        "JWT_SECRET is missing. Set JWT_SECRET to a random string of at least 32 characters in the host environment before starting Beacon Math.",
      );
    }
    if (value.length < 32) {
      throw new Error(
        `JWT_SECRET is too short (${value.length} characters). Production requires at least 32 characters.`,
      );
    }
    return value;
  }
  if (value.length < 16) {
    throw new Error("JWT_SECRET must be set to at least 16 characters.");
  }
  return value;
}

if (process.env.NODE_ENV === "production") {
  assertJwtSecret();
}

function secret() {
  return new TextEncoder().encode(assertJwtSecret());
}

/** Secure cookies are required on HTTPS. Vercel production and preview both run with NODE_ENV=production. */
export function cookieSecure(
  env: { NODE_ENV?: string; NEXT_PUBLIC_APP_URL?: string } = process.env,
): boolean {
  if (env.NODE_ENV === "production") return true;
  return (env.NEXT_PUBLIC_APP_URL ?? "").startsWith("https://");
}

export async function signParentToken(claims: ParentClaims): Promise<string> {
  return new SignJWT({ ...claims, typ: "parent" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
}

export async function signChildToken(claims: ChildClaims): Promise<string> {
  return new SignJWT({ ...claims, typ: "child" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.childId)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());
}

export async function verifyParentToken(token: string | undefined): Promise<ParentClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.typ !== "parent" || typeof payload.sub !== "string") return null;
    const role = payload.role === "ADMIN" ? "ADMIN" : "PARENT";
    return {
      sub: payload.sub,
      role,
      name: typeof payload.name === "string" ? payload.name : "",
      email: typeof payload.email === "string" ? payload.email : "",
    };
  } catch {
    return null;
  }
}

export async function verifyChildToken(token: string | undefined): Promise<ChildClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (payload.typ !== "child") return null;
    if (
      typeof payload.childId !== "string" ||
      typeof payload.sessionId !== "string" ||
      typeof payload.parentId !== "string"
    ) {
      return null;
    }
    return {
      childId: payload.childId,
      sessionId: payload.sessionId,
      parentId: payload.parentId,
      nickname: typeof payload.nickname === "string" ? payload.nickname : "Child",
      grade: typeof payload.grade === "number" ? payload.grade : 2,
    };
  } catch {
    return null;
  }
}

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: cookieSecure(),
};

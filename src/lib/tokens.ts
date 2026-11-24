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

function secret() {
  const value = process.env.JWT_SECRET ?? "";
  if (value.length < 16) {
    throw new Error("JWT_SECRET must be set to at least 16 characters.");
  }
  return new TextEncoder().encode(value);
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
  secure: process.env.NODE_ENV === "production",
};

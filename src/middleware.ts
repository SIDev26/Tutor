import { NextResponse, type NextRequest } from "next/server";
import { CHILD_COOKIE, PARENT_COOKIE, verifyChildToken, verifyParentToken } from "@/lib/tokens";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const parent = await verifyParentToken(request.cookies.get(PARENT_COOKIE)?.value);
  const child = await verifyChildToken(request.cookies.get(CHILD_COOKIE)?.value);

  if (pathname.startsWith("/child")) {
    if (!child) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/child-session")) {
    if (!child) return NextResponse.json({ error: "No child session." }, { status: 401 });
    return NextResponse.next();
  }

  const parentArea =
    pathname.startsWith("/parent") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/children");

  if (parentArea) {
    if (!parent) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Sign in required." }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/admin") && parent.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/parent", request.url));
    }
  }

  if (
    child &&
    !parent &&
    (pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    return NextResponse.redirect(new URL("/child", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};

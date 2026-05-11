import { NextResponse, type NextRequest } from "next/server";
import {
  APP_SESSION_COOKIE,
  createSessionToken,
  isAppProtectionEnabled
} from "@/lib/auth";

const publicPaths = ["/login", "/api/auth/login", "/api/auth/logout"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  if (!isAppProtectionEnabled()) {
    return NextResponse.next();
  }

  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const shouldProtect =
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/growth-chat") ||
    pathname.startsWith("/daily-stack") ||
    pathname.startsWith("/connect") ||
    pathname.startsWith("/google-") ||
    pathname.startsWith("/campaign-builder") ||
    pathname.startsWith("/meta") ||
    pathname.startsWith("/reviews") ||
    pathname.startsWith("/media") ||
    pathname.startsWith("/content") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/weekly-report") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/api/");

  if (!shouldProtect) {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(APP_SESSION_COOKIE)?.value;

  if (cookieValue && cookieValue === (await createSessionToken())) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)", "/api/:path*"]
};


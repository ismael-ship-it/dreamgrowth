import { NextResponse } from "next/server";
import { APP_SESSION_COOKIE } from "@/lib/auth";
import { buildAppUrl } from "@/lib/http/app-url";

export async function GET(request: Request) {
  const response = NextResponse.redirect(buildAppUrl(request, "/login"));
  response.cookies.set(APP_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });

  return response;
}

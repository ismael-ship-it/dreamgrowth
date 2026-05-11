import { NextResponse } from "next/server";
import {
  APP_SESSION_COOKIE,
  createSessionToken,
  isAppProtectionEnabled,
  verifyPassword
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!isAppProtectionEnabled()) {
    return NextResponse.json({ redirectTo: "/dashboard" });
  }

  const body = (await request.json()) as { password?: string };
  const valid = await verifyPassword(body.password ?? "");

  if (!valid) {
    return NextResponse.json(
      { error: "Incorrect password." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ redirectTo: "/dashboard" });
  response.cookies.set(APP_SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });

  return response;
}


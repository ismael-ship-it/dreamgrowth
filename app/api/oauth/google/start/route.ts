import { NextResponse } from "next/server";
import { getGoogleOAuthUrl } from "@/lib/oauth/google";
import { createOAuthState } from "@/lib/oauth/state";

export async function GET(request: Request) {
  try {
    const state = createOAuthState("google");
    const response = NextResponse.redirect(getGoogleOAuthUrl(state));

    response.cookies.set("dreamgrowth_google_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      path: "/"
    });

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/settings?google=setup_required", request.url)
    );
  }
}

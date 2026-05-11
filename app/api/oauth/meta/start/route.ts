import { NextResponse } from "next/server";
import { getMetaOAuthUrl } from "@/lib/oauth/meta";
import { createOAuthState } from "@/lib/oauth/state";

export async function GET(request: Request) {
  try {
    const state = createOAuthState("meta");
    const response = NextResponse.redirect(getMetaOAuthUrl(state));

    response.cookies.set("dreamgrowth_meta_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10,
      path: "/"
    });

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/settings?meta=setup_required", request.url)
    );
  }
}

import { NextResponse } from "next/server";
import { buildAppUrl } from "@/lib/http/app-url";
import { saveIntegrationConnection } from "@/lib/integrations/store";
import {
  exchangeGoogleCodeForTokens,
  fetchGoogleConnectionProfile
} from "@/lib/oauth/google";
import { parseOAuthState } from "@/lib/oauth/state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers
    .get("cookie")
    ?.match(/dreamgrowth_google_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(buildAppUrl(request, "/settings?google=oauth_error"));
  }

  if (parseOAuthState(state)?.provider !== "google") {
    return NextResponse.redirect(buildAppUrl(request, "/settings?google=invalid_state"));
  }

  try {
    const tokens = await exchangeGoogleCodeForTokens(code);
    const profile = await fetchGoogleConnectionProfile(tokens.access_token).catch(
      () => null
    );

    saveIntegrationConnection({
      provider: "google",
      status: "connected",
      displayName: profile?.displayName ?? "Google account connected",
      externalAccountId: profile?.accountId,
      scopes: tokens.scope
        ? tokens.scope.split(" ").map((scope) => scope.trim()).filter(Boolean)
        : [],
      expiresAt: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : undefined,
      metadata: {
        email: profile?.email ?? null,
        fullName: profile?.fullName ?? null,
        accountCount: profile?.accountCount ?? 0,
        accounts: profile?.accounts ?? []
      },
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenType: tokens.token_type,
      lastSyncAt: new Date().toISOString()
    });

    const response = NextResponse.redirect(
      buildAppUrl(request, "/settings?google=connected")
    );

    response.cookies.set("dreamgrowth_google_oauth_state", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/"
    });

    return response;
  } catch {
    return NextResponse.redirect(
      buildAppUrl(request, "/settings?google=token_exchange_failed")
    );
  }
}

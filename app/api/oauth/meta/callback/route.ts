import { NextResponse } from "next/server";
import { saveIntegrationConnection } from "@/lib/integrations/store";
import {
  exchangeMetaCodeForToken,
  exchangeMetaForLongLivedToken,
  fetchMetaConnectionProfile,
  metaScopes
} from "@/lib/oauth/meta";
import { parseOAuthState } from "@/lib/oauth/state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers
    .get("cookie")
    ?.match(/dreamgrowth_meta_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(
      new URL("/settings?meta=oauth_error", request.url)
    );
  }

  if (parseOAuthState(state)?.provider !== "meta") {
    return NextResponse.redirect(
      new URL("/settings?meta=invalid_state", request.url)
    );
  }

  try {
    const token = await exchangeMetaCodeForToken(code);
    const longLivedToken = await exchangeMetaForLongLivedToken(
      token.access_token
    ).catch(() => null);
    const finalToken = longLivedToken ?? token;
    const profile = await fetchMetaConnectionProfile(finalToken.access_token).catch(
      () => null
    );

    saveIntegrationConnection({
      provider: "meta",
      status: "connected",
      displayName: profile?.name ?? "Meta account connected",
      externalAccountId: profile?.id,
      scopes: metaScopes,
      expiresAt: finalToken.expires_in
        ? new Date(Date.now() + finalToken.expires_in * 1000).toISOString()
        : undefined,
      metadata: {
        pages: profile?.pages ?? [],
        tokenMode: longLivedToken ? "long_lived" : "short_lived"
      },
      accessToken: finalToken.access_token,
      tokenType: finalToken.token_type ?? token.token_type,
      lastSyncAt: new Date().toISOString()
    });

    const response = NextResponse.redirect(
      new URL("/settings?meta=connected", request.url)
    );

    response.cookies.set("dreamgrowth_meta_oauth_state", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/"
    });

    return response;
  } catch {
    return NextResponse.redirect(
      new URL("/settings?meta=token_exchange_failed", request.url)
    );
  }
}

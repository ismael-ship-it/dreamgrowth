import { NextResponse } from "next/server";
import { exchangeGoogleCodeForTokens } from "@/lib/oauth/google";
import { parseOAuthState } from "@/lib/oauth/state";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.headers
    .get("cookie")
    ?.match(/dreamgrowth_google_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || !cookieState || state !== cookieState) {
    return NextResponse.redirect(
      new URL("/settings?google=oauth_error", request.url)
    );
  }

  if (parseOAuthState(state)?.provider !== "google") {
    return NextResponse.redirect(
      new URL("/settings?google=invalid_state", request.url)
    );
  }

  try {
    const tokens = await exchangeGoogleCodeForTokens(code);

    // TODO: Store tokens.refresh_token in Supabase Vault and save only token_vault_ref.
    // TODO: Upsert integrations/google_accounts rows for the authenticated company.
    console.info("Google OAuth connected", {
      hasRefreshToken: Boolean(tokens.refresh_token),
      scope: tokens.scope
    });

    return NextResponse.redirect(
      new URL("/settings?google=connected", request.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/settings?google=token_exchange_failed", request.url)
    );
  }
}

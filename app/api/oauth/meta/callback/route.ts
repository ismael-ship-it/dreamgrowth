import { NextResponse } from "next/server";
import { exchangeMetaCodeForToken } from "@/lib/oauth/meta";
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

    // TODO: Exchange for a long-lived token where applicable, store in Vault,
    // and upsert integrations/meta_accounts rows for the authenticated company.
    console.info("Meta OAuth connected", {
      tokenType: token.token_type,
      expiresIn: token.expires_in
    });

    return NextResponse.redirect(new URL("/settings?meta=connected", request.url));
  } catch {
    return NextResponse.redirect(
      new URL("/settings?meta=token_exchange_failed", request.url)
    );
  }
}

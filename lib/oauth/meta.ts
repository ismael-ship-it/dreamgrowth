import { getOptionalEnv, getRequiredEnv } from "@/lib/env";

const metaOAuthBaseUrl = "https://www.facebook.com/v23.0/dialog/oauth";
const metaTokenUrl = "https://graph.facebook.com/v23.0/oauth/access_token";

export const metaScopes = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "business_management",
  "ads_read",
  "leads_retrieval",
  "instagram_basic",
  "instagram_content_publish"
];

export function getMetaOAuthUrl(state: string) {
  const clientId = getRequiredEnv("META_APP_ID");
  const redirectUri = getRequiredEnv("META_REDIRECT_URI");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: metaScopes.join(","),
    state
  });

  return `${metaOAuthBaseUrl}?${params.toString()}`;
}

export async function exchangeMetaCodeForToken(code: string) {
  const clientId = getRequiredEnv("META_APP_ID");
  const clientSecret = getRequiredEnv("META_APP_SECRET");
  const redirectUri = getRequiredEnv("META_REDIRECT_URI");
  const url = `${metaTokenUrl}?${new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code
  }).toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Meta token exchange failed: ${response.status}`);
  }

  return response.json() as Promise<{
    access_token: string;
    token_type: string;
    expires_in?: number;
  }>;
}

export function getMetaIntegrationReadiness() {
  return {
    appId: Boolean(getOptionalEnv("META_APP_ID")),
    appSecret: Boolean(getOptionalEnv("META_APP_SECRET")),
    redirectUri: Boolean(getOptionalEnv("META_REDIRECT_URI"))
  };
}

import { getOptionalEnv, getRequiredEnv } from "@/lib/env";

const googleOAuthBaseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
const googleTokenUrl = "https://oauth2.googleapis.com/token";

export const googleScopes = [
  "https://www.googleapis.com/auth/business.manage",
  "https://www.googleapis.com/auth/adwords",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly"
];

export function getGoogleOAuthUrl(state: string) {
  const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
  const redirectUri = getRequiredEnv("GOOGLE_REDIRECT_URI");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: googleScopes.join(" "),
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state
  });

  return `${googleOAuthBaseUrl}?${params.toString()}`;
}

export async function exchangeGoogleCodeForTokens(code: string) {
  const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getRequiredEnv("GOOGLE_CLIENT_SECRET");
  const redirectUri = getRequiredEnv("GOOGLE_REDIRECT_URI");

  const response = await fetch(googleTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed: ${response.status}`);
  }

  return response.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope: string;
    token_type: string;
  }>;
}

export function getGoogleIntegrationReadiness() {
  return {
    clientId: Boolean(getOptionalEnv("GOOGLE_CLIENT_ID")),
    clientSecret: Boolean(getOptionalEnv("GOOGLE_CLIENT_SECRET")),
    redirectUri: Boolean(getOptionalEnv("GOOGLE_REDIRECT_URI")),
    adsDeveloperToken: Boolean(getOptionalEnv("GOOGLE_ADS_DEVELOPER_TOKEN"))
  };
}

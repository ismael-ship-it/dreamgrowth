import { getOptionalEnv, getRequiredEnv } from "@/lib/env";

const googleOAuthBaseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
const googleTokenUrl = "https://oauth2.googleapis.com/token";
const googleBusinessAccountsUrl =
  "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";
const googleUserInfoUrl = "https://openidconnect.googleapis.com/v1/userinfo";

export const googleScopes = [
  "https://www.googleapis.com/auth/business.manage",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "openid"
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

export async function refreshGoogleAccessToken(refreshToken: string) {
  const clientId = getRequiredEnv("GOOGLE_CLIENT_ID");
  const clientSecret = getRequiredEnv("GOOGLE_CLIENT_SECRET");

  const response = await fetch(googleTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });

  if (!response.ok) {
    throw new Error(`Google token refresh failed: ${response.status}`);
  }

  return response.json() as Promise<{
    access_token: string;
    expires_in: number;
    scope?: string;
    token_type: string;
  }>;
}

export async function fetchGoogleConnectionProfile(accessToken: string) {
  const [userInfo, accounts] = await Promise.all([
    fetchGoogleUserInfo(accessToken),
    fetchGoogleBusinessAccounts(accessToken)
  ]);

  const primary = accounts[0];
  const displayName =
    primary?.name ?? userInfo?.name ?? userInfo?.email ?? "Google account connected";

  return {
    accountId: primary?.id ?? userInfo?.sub,
    displayName,
    email: userInfo?.email ?? null,
    fullName: userInfo?.name ?? null,
    accountCount: accounts.length,
    accounts
  };
}

async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch(googleUserInfoUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    sub?: string;
    name?: string;
    email?: string;
  };

  return {
    sub: data.sub ?? null,
    name: data.name ?? null,
    email: data.email ?? null
  };
}

async function fetchGoogleBusinessAccounts(accessToken: string) {
  const response = await fetch(googleBusinessAccountsUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as {
    accounts?: Array<{
      name?: string;
      accountName?: string;
      type?: string;
    }>;
  };

  return (
    data.accounts?.map((account) => ({
      id: account.name?.split("/").pop() ?? account.name ?? "unknown",
      name: account.accountName ?? account.name ?? "Google Business account",
      type: account.type ?? "unknown"
    })) ?? []
  );
}

export function getGoogleIntegrationReadiness() {
  return {
    clientId: Boolean(getOptionalEnv("GOOGLE_CLIENT_ID")),
    clientSecret: Boolean(getOptionalEnv("GOOGLE_CLIENT_SECRET")),
    redirectUri: Boolean(getOptionalEnv("GOOGLE_REDIRECT_URI")),
    adsDeveloperToken: Boolean(getOptionalEnv("GOOGLE_ADS_DEVELOPER_TOKEN"))
  };
}

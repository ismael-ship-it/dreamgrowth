import { getOptionalEnv, getRequiredEnv } from "@/lib/env";

const metaOAuthBaseUrl = "https://www.facebook.com/v23.0/dialog/oauth";
const metaTokenUrl = "https://graph.facebook.com/v23.0/oauth/access_token";
const metaGraphBaseUrl = "https://graph.facebook.com/v23.0";

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

export async function exchangeMetaForLongLivedToken(shortLivedAccessToken: string) {
  const clientId = getRequiredEnv("META_APP_ID");
  const clientSecret = getRequiredEnv("META_APP_SECRET");
  const url = `${metaTokenUrl}?${new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: clientId,
    client_secret: clientSecret,
    fb_exchange_token: shortLivedAccessToken
  }).toString()}`;

  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Meta long-lived token exchange failed: ${response.status}`);
  }

  return response.json() as Promise<{
    access_token: string;
    token_type?: string;
    expires_in?: number;
  }>;
}

export async function fetchMetaConnectionProfile(accessToken: string) {
  const [accountResponse, pagesResponse] = await Promise.all([
    fetch(`${metaGraphBaseUrl}/me?fields=id,name&access_token=${accessToken}`, {
      cache: "no-store"
    }),
    fetch(
      `${metaGraphBaseUrl}/me/accounts?fields=id,name,category&limit=10&access_token=${accessToken}`,
      {
        cache: "no-store"
      }
    )
  ]);

  if (!accountResponse.ok) {
    throw new Error(`Meta account fetch failed: ${accountResponse.status}`);
  }

  const account = (await accountResponse.json()) as {
    id?: string;
    name?: string;
  };
  const pagesData = pagesResponse.ok
    ? ((await pagesResponse.json()) as {
        data?: Array<{ id?: string; name?: string; category?: string }>;
      })
    : { data: [] };
  const pages =
    pagesData.data?.map((page) => ({
      id: page.id ?? "unknown",
      name: page.name ?? "Facebook Page",
      category: page.category ?? "Unknown"
    })) ?? [];

  return {
    id: account.id ?? "meta-account",
    name: account.name ?? "Meta account connected",
    pages
  };
}

export function getMetaIntegrationReadiness() {
  return {
    appId: Boolean(getOptionalEnv("META_APP_ID")),
    appSecret: Boolean(getOptionalEnv("META_APP_SECRET")),
    redirectUri: Boolean(getOptionalEnv("META_REDIRECT_URI"))
  };
}

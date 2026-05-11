import { getCompanyProfile } from "@/lib/company/profile";
import type {
  GoogleApprovalAction,
  GoogleBusinessMetric,
  GoogleBusinessPostDraft,
  GoogleBusinessReview,
  GoogleIntegrationSummary
} from "@/lib/google/types";
import {
  getGoogleSnapshot,
  saveGoogleSnapshot
} from "@/lib/integrations/snapshots";
import {
  getIntegrationConnection,
  getIntegrationCredentials,
  saveIntegrationConnection
} from "@/lib/integrations/store";
import { getMeaningfulConnectionName } from "@/lib/integrations/display-name";
import {
  fetchGoogleConnectionProfile,
  refreshGoogleAccessToken
} from "@/lib/oauth/google";

type GoogleAccount = {
  id: string;
  resourceName: string;
  accountName: string;
  type?: string;
};

type GoogleLocation = {
  id: string;
  accountId: string;
  title: string;
  websiteUri?: string;
  phone?: string;
  city?: string;
  regionCode?: string;
};

type GoogleReview = {
  id: string;
  accountId: string;
  locationId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

type GoogleSyncFailureReason =
  | "token_expired"
  | "refresh_token_missing"
  | "api_forbidden"
  | "api_not_enabled"
  | "rate_limited"
  | "no_accounts"
  | "no_locations"
  | "unknown";

type GoogleSyncFailure = {
  reason: GoogleSyncFailureReason;
  stage: "token" | "accounts" | "locations" | "reviews" | "unknown";
  status: number | null;
  message: string;
  hint: string;
  helpUrl?: string | null;
};

class GoogleSyncError extends Error {
  reason: GoogleSyncFailureReason;
  stage: GoogleSyncFailure["stage"];
  status: number | null;
  hint: string;
  helpUrl?: string | null;

  constructor(input: GoogleSyncFailure) {
    super(input.message);
    this.name = "GoogleSyncError";
    this.reason = input.reason;
    this.stage = input.stage;
    this.status = input.status;
    this.hint = input.hint;
    this.helpUrl = input.helpUrl;
  }
}

const googleAccountsUrl =
  "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";
const googleBusinessInformationBaseUrl =
  "https://mybusinessbusinessinformation.googleapis.com/v1";
const googleReviewsBaseUrl = "https://mybusiness.googleapis.com/v4";

const emptyGoogleSummary: GoogleIntegrationSummary = {
  googleBusiness: {
    metrics: [],
    reviews: [],
    postDrafts: []
  },
  googleAds: {
    wastedSpend: 0,
    searchTerms: [],
    negativeKeywordSuggestions: []
  },
  ga4: {
    metrics: []
  },
  searchConsole: {
    metrics: []
  },
  approvalRule:
    "No Google account is connected yet. Connect Google in Settings before DreamGrowth can read reviews, ads, GA4, or Search Console."
};

export function getGoogleConnection() {
  return getIntegrationConnection("google");
}

export async function getGoogleIntegrationSummary(): Promise<GoogleIntegrationSummary> {
  const connection = await hydrateGoogleConnectionIdentity(getGoogleConnection());

  if (!connection.isConnected) {
    return emptyGoogleSummary;
  }

  const snapshot = getGoogleSnapshot();

  if (snapshot) {
    return snapshot.summary;
  }

  return createConnectedPendingGoogleSummary(connection.displayName);
}

export async function syncGoogleIntegrationSummary() {
  const connection = getGoogleConnection();

  if (!connection.isConnected) {
    throw new Error("Google is not connected.");
  }

  try {
    const accessToken = await getValidGoogleAccessToken();
    const { accounts, locations } = await fetchGoogleAccountsAndLocations(
      accessToken
    );
    const reviews = await fetchGoogleReviews(accessToken, locations);
    const companyProfile = getCompanyProfile();
    const summary = buildGoogleSummary({
      companyName: companyProfile.companyName,
      primaryCity: companyProfile.primaryCity,
      accounts,
      locations,
      reviews,
      connectedDisplayName:
        getMeaningfulConnectionName(connection.displayName) ??
        "Connected owner account"
    });

    saveGoogleSnapshot(summary);
    saveIntegrationConnection({
      provider: "google",
      status: "connected",
      lastSyncAt: new Date().toISOString(),
      metadata: {
        liveSync: true,
        accountCount: accounts.length,
        locationCount: locations.length,
        lastSyncError: null,
        lastSyncAttemptAt: new Date().toISOString()
      }
    });

    return summary;
  } catch (error) {
    const failure = normalizeGoogleSyncFailure(error);

    saveIntegrationConnection({
      provider: "google",
      status: "connected",
      metadata: {
        liveSync: false,
        lastSyncError: failure,
        lastSyncAttemptAt: new Date().toISOString()
      }
    });

    throw error;
  }
}

export async function fetchGoogleBusinessSnapshot() {
  const summary = await getGoogleIntegrationSummary();
  return summary.googleBusiness;
}

export async function fetchGoogleAdsSentinelSnapshot() {
  const summary = await getGoogleIntegrationSummary();
  return summary.googleAds;
}

export async function fetchGa4Snapshot() {
  const summary = await getGoogleIntegrationSummary();
  return summary.ga4;
}

export async function fetchSearchConsoleSnapshot() {
  const summary = await getGoogleIntegrationSummary();
  return summary.searchConsole;
}

export async function createGoogleApprovalRequest(input: {
  action: GoogleApprovalAction;
  relatedRecordId: string;
}) {
  return {
    id: `approval-${input.action}-${input.relatedRecordId}`,
    status: "pending_approval",
    action: input.action,
    relatedRecordId: input.relatedRecordId,
    externalApiWillBeCalled: false,
    message:
      "Approval request created. No Google API write will happen until owner approval is recorded."
  };
}

async function getValidGoogleAccessToken() {
  const credentials = getIntegrationCredentials("google");

  if (credentials.accessToken && !isExpired(credentials.expiresAt)) {
    return credentials.accessToken;
  }

  if (!credentials.refreshToken) {
    throw new GoogleSyncError({
      reason: "refresh_token_missing",
      stage: "token",
      status: null,
      message: "Google refresh token is missing.",
      hint: "Reconnect Google in Settings so DreamGrowth can store a fresh offline token.",
      helpUrl: null
    });
  }

  const refreshed = await refreshGoogleAccessToken(credentials.refreshToken);

  saveIntegrationConnection({
    provider: "google",
    status: "connected",
    accessToken: refreshed.access_token,
    refreshToken: credentials.refreshToken,
    tokenType: refreshed.token_type,
    scopes: refreshed.scope
      ? refreshed.scope.split(" ").map((scope) => scope.trim()).filter(Boolean)
      : credentials.scopes,
    expiresAt: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
    lastSyncAt: new Date().toISOString()
  });

  return refreshed.access_token;
}

async function hydrateGoogleConnectionIdentity(connection = getGoogleConnection()) {
  if (!connection.isConnected || getMeaningfulConnectionName(connection.displayName)) {
    return connection;
  }

  try {
    const accessToken = await getValidGoogleAccessToken();
    const profile = await fetchGoogleConnectionProfile(accessToken);
    const displayName = profile.displayName || connection.displayName;

    saveIntegrationConnection({
      provider: "google",
      status: "connected",
      displayName: displayName ?? undefined,
      externalAccountId: profile.accountId ?? connection.externalAccountId ?? undefined,
      metadata: {
        email: profile.email ?? connection.metadata["email"] ?? null,
        fullName: profile.fullName ?? connection.metadata["fullName"] ?? null,
        accountCount: profile.accountCount,
        accounts: profile.accounts
      }
    });

    return getGoogleConnection();
  } catch {
    return connection;
  }
}

async function fetchGoogleAccountsAndLocations(accessToken: string) {
  const response = await fetch(googleAccountsUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw await createGoogleApiError({
      response,
      stage: "accounts",
      fallbackMessage:
        "DreamGrowth could not read Google Business accounts for this connected owner."
    });
  }

  const data = (await response.json()) as {
    accounts?: Array<{
      name?: string;
      accountName?: string;
      type?: string;
    }>;
  };
  const accounts: GoogleAccount[] =
    data.accounts?.map((account) => ({
      id: account.name?.split("/").pop() ?? "unknown-account",
      resourceName: account.name ?? "",
      accountName: account.accountName ?? "Google Business account",
      type: account.type
    })) ?? [];

  if (!accounts.length) {
    throw new GoogleSyncError({
      reason: "no_accounts",
      stage: "accounts",
      status: 200,
      message: "No Google Business accounts were returned for the connected Google user.",
      hint: "Confirm this Google user has owner or manager access to at least one Business Profile."
    });
  }

  const locationGroups = await Promise.all(
    accounts.slice(0, 10).map(async (account) => {
      const url = `${googleBusinessInformationBaseUrl}/${account.resourceName}/locations?${new URLSearchParams({
        readMask:
          "name,title,storefrontAddress.locality,storefrontAddress.regionCode,phoneNumbers.primaryPhone,websiteUri"
      }).toString()}`;
      const locationsResponse = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        cache: "no-store"
      });

      if (!locationsResponse.ok) {
        throw await createGoogleApiError({
          response: locationsResponse,
          stage: "locations",
          fallbackMessage: `DreamGrowth could not read locations for Google Business account ${account.accountName}.`
        });
      }

      const locationsData = (await locationsResponse.json()) as {
        locations?: Array<{
          name?: string;
          title?: string;
          websiteUri?: string;
          storefrontAddress?: {
            locality?: string;
            regionCode?: string;
          };
          phoneNumbers?: {
            primaryPhone?: string;
          };
        }>;
      };

      return (
        locationsData.locations?.map((location) => ({
          id: location.name?.split("/").pop() ?? "unknown-location",
          accountId: account.id,
          title: location.title ?? "Google Business location",
          websiteUri: location.websiteUri,
          phone: location.phoneNumbers?.primaryPhone,
          city: location.storefrontAddress?.locality,
          regionCode: location.storefrontAddress?.regionCode
        })) ?? []
      );
    })
  );

  const locations = locationGroups.flat();

  if (!locations.length) {
    throw new GoogleSyncError({
      reason: "no_locations",
      stage: "locations",
      status: 200,
      message: "Google Business accounts were found, but no readable locations were returned.",
      hint: "Confirm the connected Google user has access to the actual Business Profile locations and that the Business Profile APIs are enabled."
    });
  }

  return {
    accounts,
    locations
  };
}

async function fetchGoogleReviews(
  accessToken: string,
  locations: GoogleLocation[]
) {
  const reviewGroups = await Promise.all(
    locations.slice(0, 10).map(async (location) => {
      const url = `${googleReviewsBaseUrl}/accounts/${location.accountId}/locations/${location.id}/reviews`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        cache: "no-store"
      });

      if (!response.ok) {
        throw await createGoogleApiError({
          response,
          stage: "reviews",
          fallbackMessage: `DreamGrowth could not read reviews for location ${location.title}.`
        });
      }

      const data = (await response.json()) as {
        reviews?: Array<{
          reviewId?: string;
          reviewer?: { displayName?: string };
          starRating?: string;
          comment?: string;
          createTime?: string;
        }>;
      };

      return (
        data.reviews?.map((review) => ({
          id: review.reviewId ?? crypto.randomUUID(),
          accountId: location.accountId,
          locationId: location.id,
          reviewerName: review.reviewer?.displayName ?? "Google customer",
          rating: mapGoogleStarRating(review.starRating),
          comment: review.comment ?? "No written review provided.",
          createdAt: review.createTime ?? new Date().toISOString()
        })) ?? []
      );
    })
  );

  return reviewGroups.flat();
}

function buildGoogleSummary(input: {
  companyName: string;
  primaryCity: string;
  accounts: GoogleAccount[];
  locations: GoogleLocation[];
  reviews: GoogleReview[];
  connectedDisplayName: string;
}): GoogleIntegrationSummary {
  const metrics: GoogleBusinessMetric[] = [
    {
      label: "Accounts",
      value: String(input.accounts.length),
      trend: `${input.connectedDisplayName}`
    },
    {
      label: "Locations",
      value: String(input.locations.length),
      trend: input.locations.length
        ? `${input.locations
            .slice(0, 2)
            .map((location) => location.title)
            .join(", ")}`
        : "No locations returned yet"
    },
    {
      label: "Reviews fetched",
      value: String(input.reviews.length),
      trend: input.reviews.length
        ? "Latest live reviews snapshot"
        : "No reviews returned yet"
    },
    {
      label: "Last sync",
      value: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      }),
      trend: "Live Google Business read"
    }
  ];
  const reviews: GoogleBusinessReview[] = input.reviews.slice(0, 10).map((review) => ({
    id: review.id,
    reviewerName: review.reviewerName,
    rating: review.rating,
    comment: review.comment,
    sentiment: mapReviewSentiment(review.rating),
    responseDraft: `Thank you for choosing ${input.companyName}. We appreciate you taking the time to share your feedback.`,
    responseStatus: "draft",
    createdAt: review.createdAt.slice(0, 10)
  }));
  const firstLocation = input.locations[0];
  const postDrafts: GoogleBusinessPostDraft[] = firstLocation
    ? [
        {
          id: `gbp-draft-${firstLocation.id}`,
          title: `${input.companyName} project update`,
          body: `Recent work completed in ${firstLocation.city ?? input.primaryCity}. This draft is ready for owner review before publishing to Google Business Profile.`,
          sourcePhoto: firstLocation.title,
          status: "draft"
        }
      ]
    : [];

  return {
    googleBusiness: {
      metrics,
      reviews,
      postDrafts
    },
    googleAds: {
      wastedSpend: 0,
      searchTerms: [],
      negativeKeywordSuggestions: []
    },
    ga4: {
      metrics: []
    },
    searchConsole: {
      metrics: []
    },
    approvalRule:
      "Google Business accounts, locations, and reviews are now read from the live Google connection. Google Ads, GA4, and Search Console are not synced yet, so DreamGrowth should not claim live performance insights from them."
  };
}

function createConnectedPendingGoogleSummary(displayName?: string | null) {
  const connectedAs =
    getMeaningfulConnectionName(displayName) ?? "Connected owner account";

  return {
    googleBusiness: {
      metrics: [
        {
          label: "Connection",
          value: "Ready",
          trend: connectedAs
        },
        {
          label: "Live sync",
          value: "Pending",
          trend: "Run the first Google sync"
        }
      ],
      reviews: [],
      postDrafts: []
    },
    googleAds: {
      wastedSpend: 0,
      searchTerms: [],
      negativeKeywordSuggestions: []
    },
    ga4: {
      metrics: []
    },
    searchConsole: {
      metrics: []
    },
    approvalRule:
      "Google is connected, but DreamGrowth does not have a completed live sync yet. Until the first sync succeeds, the app should not present Google reviews, ads, GA4, or Search Console insights as real data."
  } satisfies GoogleIntegrationSummary;
}

function mapGoogleStarRating(value?: string) {
  switch (value) {
    case "ONE":
      return 1;
    case "TWO":
      return 2;
    case "THREE":
      return 3;
    case "FOUR":
      return 4;
    case "FIVE":
      return 5;
    default:
      return 5;
  }
}

function mapReviewSentiment(rating: number) {
  if (rating >= 5) return "positive" as const;
  if (rating >= 3) return "neutral" as const;
  return "negative" as const;
}

function isExpired(expiresAt: string | null) {
  if (!expiresAt) {
    return true;
  }

  return new Date(expiresAt).getTime() <= Date.now() + 60_000;
}

async function createGoogleApiError(input: {
  response: Response;
  stage: GoogleSyncFailure["stage"];
  fallbackMessage: string;
}) {
  const raw = await safeReadGoogleErrorBody(input.response);
  const parsed = parseGoogleApiErrorPayload(raw);
  const reason = classifyGoogleApiFailure(input.response.status, parsed, raw);

  return new GoogleSyncError({
    reason,
    stage: input.stage,
    status: input.response.status,
    message: parsed?.message
      ? `${input.fallbackMessage} ${parsed.message}`
      : input.fallbackMessage,
    hint: getGoogleSyncHint(reason, input.stage),
    helpUrl: parsed?.helpUrl ?? null
  });
}

async function safeReadGoogleErrorBody(response: Response) {
  try {
    const body = await response.text();
    return body.trim() || null;
  } catch {
    return null;
  }
}

function classifyGoogleApiFailure(
  status: number,
  parsed: ReturnType<typeof parseGoogleApiErrorPayload>,
  rawBody: string | null
): GoogleSyncFailureReason {
  const normalized = rawBody?.toLowerCase() ?? "";

  if (
    normalized.includes("service disabled") ||
    normalized.includes("api has not been used") ||
    parsed?.googleReason === "SERVICE_DISABLED" ||
    parsed?.message.toLowerCase().includes("enable it by visiting")
  ) {
    return "api_not_enabled";
  }

  if (status === 401) {
    return "token_expired";
  }

  if (status === 403) {
    return "api_forbidden";
  }

  if (status === 404) {
    return "api_not_enabled";
  }

  if (status === 429) {
    return "rate_limited";
  }

  return "unknown";
}

function getGoogleSyncHint(
  reason: GoogleSyncFailureReason,
  stage: GoogleSyncFailure["stage"]
) {
  switch (reason) {
    case "refresh_token_missing":
      return "Reconnect Google in Settings to store a fresh offline token.";
    case "token_expired":
      return "Reconnect Google in Settings so DreamGrowth can refresh the token cleanly.";
    case "api_forbidden":
      return stage === "accounts"
        ? "Check that the connected Google user can access Business Profile data and that the Business Profile Account Management API is enabled in Google Cloud."
        : "Check that the Business Profile APIs are enabled in Google Cloud and that this Google user has access to the Business Profile locations.";
    case "api_not_enabled":
    return "Enable the required Google Business Profile APIs in Google Cloud, then run sync again.";
    case "rate_limited":
      return "Wait a minute and try Sync Google again.";
    case "no_accounts":
      return "Use a Google user that actually owns or manages a Business Profile account.";
    case "no_locations":
      return "Confirm the connected user can read the real Business Profile locations for this business.";
    default:
      return "Reconnect Google and check the Business Profile APIs and account access.";
  }
}

function normalizeGoogleSyncFailure(error: unknown): GoogleSyncFailure {
  if (error instanceof GoogleSyncError) {
    return {
      reason: error.reason,
      stage: error.stage,
      status: error.status,
      message: error.message,
      hint: error.hint
      ,
      helpUrl: error.helpUrl ?? null
    };
  }

  const message = error instanceof Error ? error.message : String(error);

  return {
    reason: "unknown",
    stage: "unknown",
    status: null,
    message,
    hint: "Reconnect Google and check that the Business Profile APIs are enabled and the correct owner account is connected.",
    helpUrl: null
  };
}

function parseGoogleApiErrorPayload(rawBody: string | null) {
  if (!rawBody) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawBody) as {
      error?: {
        message?: string;
        details?: Array<{
          ["@type"]?: string;
          reason?: string;
          links?: Array<{ url?: string }>;
          metadata?: { activationUrl?: string };
        }>;
      };
    };
    const details = parsed.error?.details ?? [];
    const errorInfo = details.find(
      (detail) => detail["@type"] === "type.googleapis.com/google.rpc.ErrorInfo"
    );
    const help = details.find(
      (detail) => detail["@type"] === "type.googleapis.com/google.rpc.Help"
    );

    return {
      message: parsed.error?.message ?? rawBody,
      googleReason: errorInfo?.reason ?? null,
      helpUrl:
        errorInfo?.metadata?.activationUrl ??
        help?.links?.find((link) => link.url)?.url ??
        null
    };
  } catch {
    return {
      message: rawBody,
      googleReason: null,
      helpUrl: null
    };
  }
}

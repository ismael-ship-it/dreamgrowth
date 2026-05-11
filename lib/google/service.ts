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
import { refreshGoogleAccessToken } from "@/lib/oauth/google";

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
  const connection = getGoogleConnection();

  if (!connection.isConnected) {
    return emptyGoogleSummary;
  }

  const snapshot = getGoogleSnapshot();

  if (snapshot) {
    return snapshot.summary;
  }

  try {
    return await syncGoogleIntegrationSummary();
  } catch {
    return createConnectedPendingGoogleSummary(connection.displayName);
  }
}

export async function syncGoogleIntegrationSummary() {
  const connection = getGoogleConnection();

  if (!connection.isConnected) {
    throw new Error("Google is not connected.");
  }

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
    connectedDisplayName: connection.displayName ?? "Google account connected"
  });

  saveGoogleSnapshot(summary);
  saveIntegrationConnection({
    provider: "google",
    status: "connected",
    lastSyncAt: new Date().toISOString(),
    metadata: {
      liveSync: true,
      accountCount: accounts.length,
      locationCount: locations.length
    }
  });

  return summary;
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
    throw new Error("Google refresh token is missing.");
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

async function fetchGoogleAccountsAndLocations(accessToken: string) {
  const response = await fetch(googleAccountsUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Google accounts fetch failed: ${response.status}`);
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
        return [] as GoogleLocation[];
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

  return {
    accounts,
    locations: locationGroups.flat()
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
        return [] as GoogleReview[];
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
  return {
    googleBusiness: {
      metrics: [
        {
          label: "Connection",
          value: "Ready",
          trend: displayName ?? "Google account connected"
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

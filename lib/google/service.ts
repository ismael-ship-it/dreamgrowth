import { googleIntegrationSummary } from "@/lib/google/mock-data";
import type {
  GoogleApprovalAction,
  GoogleIntegrationSummary
} from "@/lib/google/types";
import { getIntegrationConnection } from "@/lib/integrations/store";

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

  return {
    ...googleIntegrationSummary,
    approvalRule: `${googleIntegrationSummary.approvalRule} Connected locally as ${
      connection.displayName ?? "Google account"
    }. Live sync is still in guided sample mode while API sync is being wired.`
  };
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

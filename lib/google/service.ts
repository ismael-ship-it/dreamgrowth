import { googleIntegrationSummary } from "@/lib/google/mock-data";
import type {
  GoogleApprovalAction,
  GoogleIntegrationSummary
} from "@/lib/google/types";

export async function getGoogleIntegrationSummary(): Promise<GoogleIntegrationSummary> {
  return googleIntegrationSummary;
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

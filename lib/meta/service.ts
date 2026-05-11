import { metaIntegrationSummary } from "@/lib/meta/mock-data";
import type {
  MetaApprovalAction,
  MetaIntegrationSummary
} from "@/lib/meta/types";

export async function getMetaIntegrationSummary(): Promise<MetaIntegrationSummary> {
  return metaIntegrationSummary;
}

export async function fetchMetaAccountsSnapshot() {
  const summary = await getMetaIntegrationSummary();
  return {
    account: summary.account,
    facebookPages: summary.facebookPages,
    instagramAccounts: summary.instagramAccounts,
    adAccounts: summary.adAccounts
  };
}

export async function fetchMetaCampaignsSnapshot() {
  const summary = await getMetaIntegrationSummary();
  return {
    campaigns: summary.campaigns,
    adAccounts: summary.adAccounts
  };
}

export async function fetchMetaLeadsSnapshot() {
  const summary = await getMetaIntegrationSummary();
  return {
    leads: summary.leads,
    inboxReadiness: summary.inboxReadiness
  };
}

export async function fetchMetaPublishingSnapshot() {
  const summary = await getMetaIntegrationSummary();
  return {
    drafts: summary.drafts,
    approvalRule: summary.approvalRule
  };
}

export async function createMetaApprovalRequest(input: {
  action: MetaApprovalAction;
  relatedRecordId: string;
}) {
  return {
    id: `meta-approval-${input.action}-${input.relatedRecordId}`,
    status: "pending_approval",
    action: input.action,
    relatedRecordId: input.relatedRecordId,
    externalApiWillBeCalled: false,
    message:
      "Meta approval request created. No Facebook or Instagram API write will happen until owner approval is recorded."
  };
}

import { metaIntegrationSummary } from "@/lib/meta/mock-data";
import type {
  MetaApprovalAction,
  MetaIntegrationSummary
} from "@/lib/meta/types";
import { getIntegrationConnection } from "@/lib/integrations/store";

const emptyMetaSummary: MetaIntegrationSummary = {
  account: {
    id: "meta-not-connected",
    displayName: "Meta not connected",
    status: "not_connected"
  },
  facebookPages: [],
  instagramAccounts: [],
  adAccounts: [],
  campaigns: [],
  leads: [],
  drafts: [],
  inboxReadiness: {
    messengerReady: false,
    instagramDmReady: false,
    unifiedInboxPlanned: true,
    note:
      "Connect Meta in Settings before DreamGrowth can read Pages, Instagram, Ads, or leads."
  },
  approvalRule:
    "No Meta account is connected yet. Connect Meta in Settings before DreamGrowth can read Pages, Instagram, Ads, or leads."
};

export function getMetaConnection() {
  return getIntegrationConnection("meta");
}

export async function getMetaIntegrationSummary(): Promise<MetaIntegrationSummary> {
  const connection = getMetaConnection();

  if (!connection.isConnected) {
    return emptyMetaSummary;
  }

  return {
    ...metaIntegrationSummary,
    account: {
      ...metaIntegrationSummary.account,
      id: connection.externalAccountId ?? metaIntegrationSummary.account.id,
      displayName:
        connection.displayName ?? metaIntegrationSummary.account.displayName,
      status: "connected"
    },
    facebookPages:
      ((connection.metadata.pages as Array<{
        id?: string;
        name?: string;
        category?: string;
      }> | undefined)?.map((page) => ({
        id: page.id ?? crypto.randomUUID(),
        name: page.name ?? "Facebook Page",
        category: page.category ?? "Unknown",
        followers: 0,
        status: "connected" as const
      })) ?? metaIntegrationSummary.facebookPages),
    approvalRule: `${metaIntegrationSummary.approvalRule} Connected locally as ${
      connection.displayName ?? "Meta account"
    }. Campaign and lead cards remain in guided sample mode until live sync is wired.`
  };
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

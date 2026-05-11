import {
  getMetaSnapshot,
  saveMetaSnapshot
} from "@/lib/integrations/snapshots";
import {
  getIntegrationConnection,
  getIntegrationCredentials,
  saveIntegrationConnection
} from "@/lib/integrations/store";
import type {
  MetaAccount,
  MetaApprovalAction,
  MetaIntegrationSummary
} from "@/lib/meta/types";

const metaGraphBaseUrl = "https://graph.facebook.com/v23.0";

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

  const snapshot = getMetaSnapshot();

  if (snapshot) {
    return snapshot.summary;
  }

  try {
    return await syncMetaIntegrationSummary();
  } catch {
    return {
      ...emptyMetaSummary,
      account: {
        id: connection.externalAccountId ?? "meta-account",
        displayName: connection.displayName ?? "Meta account connected",
        status: "connected"
      },
      approvalRule:
        "Meta is connected, but the first live sync has not completed yet. Reconnect or run sync again from the Meta page."
    };
  }
}

export async function syncMetaIntegrationSummary() {
  const connection = getMetaConnection();

  if (!connection.isConnected) {
    throw new Error("Meta is not connected.");
  }

  const accessToken = getValidMetaAccessToken();
  const [account, pages, instagramAccounts, adAccounts] = await Promise.all([
    fetchMetaAccount(accessToken),
    fetchMetaPages(accessToken),
    fetchMetaInstagramAccounts(accessToken),
    fetchMetaAdAccounts(accessToken)
  ]);
  const summary: MetaIntegrationSummary = {
    account,
    facebookPages: pages,
    instagramAccounts,
    adAccounts,
    campaigns: [],
    leads: [],
    drafts: [],
    inboxReadiness: {
      messengerReady: pages.length > 0,
      instagramDmReady: instagramAccounts.length > 0,
      unifiedInboxPlanned: true,
      note:
        "Pages, Instagram, and ad accounts are being read from the live Meta connection. Leads, publishing, and inbox actions still need dedicated sync work."
    },
    approvalRule:
      "Meta account, Pages, Instagram accounts, and ad accounts are now read from the live Meta connection. Leads, campaigns, and publishing still need their own live sync layer."
  };

  saveMetaSnapshot(summary);
  saveIntegrationConnection({
    provider: "meta",
    status: "connected",
    displayName: account.displayName,
    externalAccountId: account.id,
    lastSyncAt: new Date().toISOString(),
    metadata: {
      liveSync: true,
      pageCount: pages.length,
      instagramCount: instagramAccounts.length,
      adAccountCount: adAccounts.length,
      pages: pages.map((page) => ({
        id: page.id,
        name: page.name,
        category: page.category
      }))
    }
  });

  return summary;
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

function getValidMetaAccessToken() {
  const credentials = getIntegrationCredentials("meta");

  if (!credentials.accessToken) {
    throw new Error("Meta access token is missing.");
  }

  return credentials.accessToken;
}

async function fetchMetaAccount(accessToken: string): Promise<MetaAccount> {
  const response = await fetch(
    `${metaGraphBaseUrl}/me?fields=id,name&access_token=${accessToken}`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(`Meta account fetch failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    id?: string;
    name?: string;
  };

  return {
    id: data.id ?? "meta-account",
    displayName: data.name ?? "Meta account connected",
    status: "connected"
  };
}

async function fetchMetaPages(accessToken: string) {
  const response = await fetch(
    `${metaGraphBaseUrl}/me/accounts?fields=id,name,category,fan_count,instagram_business_account{id,username}&access_token=${accessToken}`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    return [] as MetaIntegrationSummary["facebookPages"];
  }

  const data = (await response.json()) as {
    data?: Array<{
      id?: string;
      name?: string;
      category?: string;
      fan_count?: number;
    }>;
  };

  return (
    data.data?.map((page) => ({
      id: page.id ?? crypto.randomUUID(),
      name: page.name ?? "Facebook Page",
      category: page.category ?? "Unknown",
      followers: page.fan_count ?? 0,
      status: "connected" as const
    })) ?? []
  );
}

async function fetchMetaInstagramAccounts(accessToken: string) {
  const response = await fetch(
    `${metaGraphBaseUrl}/me/accounts?fields=instagram_business_account{id,username}&access_token=${accessToken}`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    return [] as MetaIntegrationSummary["instagramAccounts"];
  }

  const data = (await response.json()) as {
    data?: Array<{
      instagram_business_account?: {
        id?: string;
        username?: string;
      };
    }>;
  };
  const accounts = data.data
    ?.map((page) => page.instagram_business_account)
    .filter(Boolean) as Array<{ id?: string; username?: string }> | undefined;

  return (
    accounts?.map((account) => ({
      id: account.id ?? crypto.randomUUID(),
      username: account.username ?? "instagram_business",
      followers: 0,
      status: "connected" as const
    })) ?? []
  );
}

async function fetchMetaAdAccounts(accessToken: string) {
  const response = await fetch(
    `${metaGraphBaseUrl}/me/adaccounts?fields=id,name,amount_spent,account_status&access_token=${accessToken}`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    return [] as MetaIntegrationSummary["adAccounts"];
  }

  const data = (await response.json()) as {
    data?: Array<{
      id?: string;
      name?: string;
      amount_spent?: string;
      account_status?: number;
    }>;
  };

  return (
    data.data?.map((account) => ({
      id: account.id ?? crypto.randomUUID(),
      name: account.name ?? "Meta Ad Account",
      spend: Number(account.amount_spent ?? 0),
      leads: 0,
      status: account.account_status === 1 ? ("active" as const) : ("paused" as const)
    })) ?? []
  );
}

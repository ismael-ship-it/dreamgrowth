export type MetaApprovalAction =
  | "publish_facebook_post"
  | "publish_instagram_post"
  | "schedule_social_post";

export type MetaAccount = {
  id: string;
  displayName: string;
  status: "connected" | "expired" | "not_connected";
};

export type FacebookPage = {
  id: string;
  name: string;
  category: string;
  followers: number;
  status: "connected" | "needs_attention";
};

export type InstagramBusinessAccount = {
  id: string;
  username: string;
  followers: number;
  status: "connected" | "needs_attention";
};

export type MetaAdAccount = {
  id: string;
  name: string;
  spend: number;
  leads: number;
  status: "active" | "paused";
};

export type MetaCampaign = {
  id: string;
  name: string;
  objective: string;
  spend: number;
  leads: number;
  note: string;
};

export type MetaLead = {
  id: string;
  name: string;
  source: "facebook" | "instagram";
  serviceInterest: string;
  status: "new" | "contacted" | "booked";
  ageMinutes: number;
};

export type MetaSocialDraft = {
  id: string;
  target: "facebook" | "instagram";
  title: string;
  body: string;
  sourcePhoto: string;
  status: "pending_approval" | "draft" | "scheduled";
};

export type MetaIntegrationSummary = {
  account: MetaAccount;
  facebookPages: FacebookPage[];
  instagramAccounts: InstagramBusinessAccount[];
  adAccounts: MetaAdAccount[];
  campaigns: MetaCampaign[];
  leads: MetaLead[];
  drafts: MetaSocialDraft[];
  inboxReadiness: {
    messengerReady: boolean;
    instagramDmReady: boolean;
    unifiedInboxPlanned: boolean;
    note: string;
  };
  approvalRule: string;
};

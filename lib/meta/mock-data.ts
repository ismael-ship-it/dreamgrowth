import type { MetaIntegrationSummary } from "@/lib/meta/types";

export const metaIntegrationSummary: MetaIntegrationSummary = {
  account: {
    id: "meta-account-001",
    displayName: "DreamGrowth Demo Business",
    status: "connected"
  },
  facebookPages: [
    {
      id: "fb-page-001",
      name: "Northborough Countertop Studio",
      category: "Home improvement",
      followers: 1840,
      status: "connected"
    }
  ],
  instagramAccounts: [
    {
      id: "ig-business-001",
      username: "northboroughcountertops",
      followers: 1290,
      status: "connected"
    }
  ],
  adAccounts: [
    {
      id: "meta-ad-account-001",
      name: "Local Remodel Leads",
      spend: 124,
      leads: 4,
      status: "active"
    }
  ],
  campaigns: [
    {
      id: "meta-campaign-001",
      name: "Spring showroom visits",
      objective: "Lead generation",
      spend: 124,
      leads: 4,
      note: "Good lead cost, but follow-up speed matters more than more spend."
    }
  ],
  leads: [
    {
      id: "meta-lead-001",
      name: "New Facebook lead",
      source: "facebook",
      serviceInterest: "Quartz countertop estimate",
      status: "new",
      ageMinutes: 36
    }
  ],
  drafts: [
    {
      id: "meta-draft-001",
      target: "facebook",
      title: "Quartz project post",
      body:
        "Recent quartz countertop installation completed in Northborough, MA. A clean, practical update using real project photos from the job.",
      sourcePhoto: "Northborough quartz install",
      status: "pending_approval"
    },
    {
      id: "meta-draft-002",
      target: "instagram",
      title: "Instagram caption",
      body:
        "Quartz countertop installation in Northborough. Real project photo, simple finish, built for everyday use.",
      sourcePhoto: "Northborough quartz install",
      status: "pending_approval"
    }
  ],
  inboxReadiness: {
    messengerReady: true,
    instagramDmReady: true,
    unifiedInboxPlanned: true,
    note:
      "Messenger and Instagram DM objects are modeled for a future unified inbox, but Stage 5 does not send replies."
  },
  approvalRule:
    "Meta posts and scheduled publishing are drafts only until the owner approves them."
};

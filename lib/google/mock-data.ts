import type { GoogleIntegrationSummary } from "@/lib/google/types";

export const googleIntegrationSummary: GoogleIntegrationSummary = {
  googleBusiness: {
    metrics: [
      { label: "Calls", value: "18", trend: "+12% vs last week" },
      { label: "Directions", value: "9", trend: "+3 vs last week" },
      { label: "Website clicks", value: "31", trend: "+18% vs last week" },
      { label: "Profile views", value: "428", trend: "+22% vs last week" }
    ],
    reviews: [
      {
        id: "google-review-001",
        reviewerName: "Recent customer",
        rating: 5,
        comment: "Great countertop install and very clean work.",
        sentiment: "positive",
        responseDraft:
          "Thank you for the kind review. We appreciate you choosing us for your countertop installation.",
        responseStatus: "pending_approval",
        createdAt: "2026-05-10"
      }
    ],
    postDrafts: [
      {
        id: "gbp-post-draft-001",
        title: "Quartz countertop installation in Northborough",
        body:
          "Recent quartz countertop installation completed in Northborough, MA. Clean seams, simple finish, and ready for everyday use.",
        sourcePhoto: "Northborough quartz project",
        status: "pending_approval"
      }
    ]
  },
  googleAds: {
    wastedSpend: 42,
    searchTerms: [
      {
        id: "search-term-001",
        searchTerm: "free countertop samples by mail",
        cost: 18,
        clicks: 4,
        conversions: 0,
        decision: "unreviewed",
        lowIntentReason: "Free sample intent, not a local installation lead."
      },
      {
        id: "search-term-002",
        searchTerm: "diy quartz countertop installation",
        cost: 14,
        clicks: 3,
        conversions: 0,
        decision: "unreviewed",
        lowIntentReason: "DIY intent, unlikely to call a local fabricator."
      },
      {
        id: "search-term-003",
        searchTerm: "countertop installer near me",
        cost: 10,
        clicks: 2,
        conversions: 1,
        decision: "keep",
        lowIntentReason: "High local intent with conversion activity."
      }
    ],
    negativeKeywordSuggestions: [
      {
        id: "negative-001",
        searchTermId: "search-term-001",
        keyword: "free",
        matchType: "phrase",
        reason: "Blocks free-sample shoppers before they spend more budget.",
        estimatedWaste: 18,
        confidenceScore: 92,
        status: "pending"
      },
      {
        id: "negative-002",
        searchTermId: "search-term-002",
        keyword: "diy",
        matchType: "phrase",
        reason: "Blocks do-it-yourself searches that rarely become booked jobs.",
        estimatedWaste: 14,
        confidenceScore: 88,
        status: "pending"
      }
    ]
  },
  ga4: {
    metrics: [
      {
        source: "google / organic",
        sessions: 126,
        conversions: 7,
        note: "Local service pages are carrying most organic leads."
      },
      {
        source: "google / cpc",
        sessions: 84,
        conversions: 5,
        note: "Paid traffic is working, but search terms need cleanup."
      },
      {
        source: "facebook / social",
        sessions: 31,
        conversions: 1,
        note: "Social is a trust layer, not the strongest lead source."
      }
    ]
  },
  searchConsole: {
    metrics: [
      {
        query: "quartz countertops northborough",
        page: "/quartz-countertops",
        clicks: 11,
        impressions: 248,
        position: 6.8,
        action: "Add a clearer local project photo and city mention."
      },
      {
        query: "countertop installation near me",
        page: "/countertop-installation",
        clicks: 7,
        impressions: 314,
        position: 9.4,
        action: "Improve title and add recent install proof."
      }
    ]
  },
  approvalRule: "Google actions are drafted only. The owner must approve before DreamGrowth calls an external API."
};

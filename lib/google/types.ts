export type GoogleApprovalAction =
  | "publish_review_response"
  | "publish_gbp_post"
  | "apply_negative_keyword";

export type GoogleBusinessReview = {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  sentiment: "positive" | "neutral" | "negative";
  responseDraft: string;
  responseStatus: "pending_approval" | "published" | "draft";
  createdAt: string;
};

export type GoogleBusinessMetric = {
  label: string;
  value: string;
  trend: string;
};

export type GoogleBusinessPostDraft = {
  id: string;
  title: string;
  body: string;
  sourcePhoto: string;
  status: "pending_approval" | "draft" | "scheduled";
};

export type GoogleAdsSearchTerm = {
  id: string;
  searchTerm: string;
  cost: number;
  clicks: number;
  conversions: number;
  decision: "unreviewed" | "keep" | "watch" | "negative";
  lowIntentReason: string;
};

export type NegativeKeywordSuggestion = {
  id: string;
  searchTermId: string;
  keyword: string;
  matchType: "phrase" | "exact";
  reason: string;
  estimatedWaste: number;
  confidenceScore: number;
  status: "pending" | "approved" | "applied";
};

export type Ga4Metric = {
  source: string;
  sessions: number;
  conversions: number;
  note: string;
};

export type SearchConsoleMetric = {
  query: string;
  page: string;
  clicks: number;
  impressions: number;
  position: number;
  action: string;
};

export type GoogleIntegrationSummary = {
  googleBusiness: {
    metrics: GoogleBusinessMetric[];
    reviews: GoogleBusinessReview[];
    postDrafts: GoogleBusinessPostDraft[];
  };
  googleAds: {
    wastedSpend: number;
    searchTerms: GoogleAdsSearchTerm[];
    negativeKeywordSuggestions: NegativeKeywordSuggestion[];
  };
  ga4: {
    metrics: Ga4Metric[];
  };
  searchConsole: {
    metrics: SearchConsoleMetric[];
  };
  approvalRule: string;
};

export type TaskType =
  | "wasted_spend"
  | "negative_keyword_review"
  | "review_response"
  | "review_request"
  | "google_business_post"
  | "photo_upload"
  | "meta_post"
  | "lead_follow_up"
  | "weekly_report"
  | "seo_cleanup";

export type SourcePlatform =
  | "google_business"
  | "google_ads"
  | "ga4"
  | "search_console"
  | "meta"
  | "facebook"
  | "instagram"
  | "manual"
  | "ai";

export type GrowthTask = {
  id: string;
  taskType: TaskType;
  title: string;
  reason: string;
  suggestedAction: string;
  impactScore: number;
  urgencyScore: number;
  urgency: "High" | "Medium" | "Low";
  confidenceScore: number;
  estimatedTimeMinutes: number;
  estimatedTime: string;
  requiresApproval: boolean;
  sourcePlatform: SourcePlatform;
  source: string;
  relatedRecordId: string;
  priorityRank: number;
  weightedScore: number;
};

type GrowthSignal = {
  id: string;
  priorityRank: number;
  taskType: TaskType;
  sourcePlatform: SourcePlatform;
  title: string;
  reason: string;
  suggestedAction: string;
  moneyImpact: number;
  urgency: number;
  confidence: number;
  seoImpact: number;
  visibilityImpact: number;
  reviewMomentum: number;
  postingActivity: number;
  estimatedTimeMinutes: number;
  relatedRecordId: string;
};

const sourceLabels: Record<SourcePlatform, string> = {
  google_business: "Google Business",
  google_ads: "Google Ads",
  ga4: "GA4",
  search_console: "Search Console",
  meta: "Meta",
  facebook: "Facebook",
  instagram: "Instagram",
  manual: "Manual",
  ai: "AI Growth Brain"
};

export const priorityOrder: TaskType[] = [
  "wasted_spend",
  "negative_keyword_review",
  "review_response",
  "google_business_post",
  "photo_upload",
  "review_request",
  "meta_post",
  "weekly_report",
  "seo_cleanup",
  "lead_follow_up"
];

export const mockGrowthSignals: GrowthSignal[] = [
  {
    id: "signal-waste-001",
    priorityRank: 1,
    taskType: "wasted_spend",
    sourcePlatform: "google_ads",
    title: "Review 5 wasted Google Ads searches",
    reason:
      "You spent $42 this week on low-intent searches like DIY pricing and free samples.",
    suggestedAction:
      "Review the 5 search terms and approve the bad ones as negative keywords.",
    moneyImpact: 96,
    urgency: 92,
    confidence: 91,
    seoImpact: 20,
    visibilityImpact: 45,
    reviewMomentum: 0,
    postingActivity: 0,
    estimatedTimeMinutes: 6,
    relatedRecordId: "ads-search-term-pack-001"
  },
  {
    id: "signal-review-001",
    priorityRank: 2,
    taskType: "review_response",
    sourcePlatform: "google_business",
    title: "Respond to 1 new Google review",
    reason:
      "A fresh 5-star review is waiting. A quick owner reply helps trust and local visibility.",
    suggestedAction:
      "Approve the drafted response or make a quick edit before posting it.",
    moneyImpact: 35,
    urgency: 86,
    confidence: 88,
    seoImpact: 68,
    visibilityImpact: 76,
    reviewMomentum: 94,
    postingActivity: 0,
    estimatedTimeMinutes: 3,
    relatedRecordId: "google-review-001"
  },
  {
    id: "signal-gbp-001",
    priorityRank: 3,
    taskType: "google_business_post",
    sourcePlatform: "google_business",
    title: "Approve today's Google Business post",
    reason:
      "Your profile has been quiet this week. A draft is ready from the Northborough project photo.",
    suggestedAction:
      "Review the local post draft and approve it for Google Business Profile.",
    moneyImpact: 28,
    urgency: 74,
    confidence: 86,
    seoImpact: 82,
    visibilityImpact: 88,
    reviewMomentum: 18,
    postingActivity: 84,
    estimatedTimeMinutes: 2,
    relatedRecordId: "gbp-post-draft-001"
  },
  {
    id: "signal-photo-001",
    priorityRank: 4,
    taskType: "photo_upload",
    sourcePlatform: "google_business",
    title: "Upload 3 real project photos",
    reason:
      "Your profile has not added new project photos in 9 days. Use the recent quartz install.",
    suggestedAction:
      "Upload 3 clear job photos and tag them with city, service, and material.",
    moneyImpact: 22,
    urgency: 69,
    confidence: 84,
    seoImpact: 74,
    visibilityImpact: 87,
    reviewMomentum: 10,
    postingActivity: 91,
    estimatedTimeMinutes: 5,
    relatedRecordId: "media-gap-001"
  },
  {
    id: "signal-review-request-001",
    priorityRank: 5,
    taskType: "review_request",
    sourcePlatform: "manual",
    title: "Ask 2 customers for reviews",
    reason:
      "Two completed jobs are still inside the best review window. Send the request today.",
    suggestedAction:
      "Send review requests to the two completed jobs while the work is still fresh.",
    moneyImpact: 32,
    urgency: 70,
    confidence: 78,
    seoImpact: 72,
    visibilityImpact: 66,
    reviewMomentum: 92,
    postingActivity: 0,
    estimatedTimeMinutes: 4,
    relatedRecordId: "review-request-batch-001"
  },
  {
    id: "signal-meta-001",
    priorityRank: 6,
    taskType: "meta_post",
    sourcePlatform: "instagram",
    title: "Approve one Instagram project caption",
    reason:
      "A real showroom photo can be reused as a simple local Instagram post today.",
    suggestedAction:
      "Review the caption, confirm the city and material, then schedule it.",
    moneyImpact: 16,
    urgency: 45,
    confidence: 74,
    seoImpact: 26,
    visibilityImpact: 58,
    reviewMomentum: 0,
    postingActivity: 76,
    estimatedTimeMinutes: 3,
    relatedRecordId: "instagram-draft-001"
  },
  {
    id: "signal-report-001",
    priorityRank: 7,
    taskType: "weekly_report",
    sourcePlatform: "ai",
    title: "Review this week's growth wins",
    reason:
      "DreamGrowth found ad savings, reviews gained, and posts ready to publish.",
    suggestedAction:
      "Review the weekly win summary and share the next focus with your team.",
    moneyImpact: 44,
    urgency: 28,
    confidence: 83,
    seoImpact: 36,
    visibilityImpact: 48,
    reviewMomentum: 42,
    postingActivity: 20,
    estimatedTimeMinutes: 4,
    relatedRecordId: "weekly-report-001"
  },
  {
    id: "signal-seo-001",
    priorityRank: 8,
    taskType: "seo_cleanup",
    sourcePlatform: "search_console",
    title: "Clean up one service page title",
    reason:
      "A countertop installation page is getting impressions but weak clicks from local searches.",
    suggestedAction:
      "Review the suggested title and add the city/service wording if it matches the page.",
    moneyImpact: 18,
    urgency: 24,
    confidence: 69,
    seoImpact: 80,
    visibilityImpact: 54,
    reviewMomentum: 0,
    postingActivity: 0,
    estimatedTimeMinutes: 8,
    relatedRecordId: "search-console-page-001"
  }
];

export function generateDailyGrowthStack(signals: GrowthSignal[]): GrowthTask[] {
  return signals
    .map(toGrowthTask)
    .sort(compareGrowthTasks)
    .slice(0, 5);
}

function toGrowthTask(signal: GrowthSignal): GrowthTask {
  const baseImpactScore = clampScore(
    signal.moneyImpact * 0.28 +
      signal.seoImpact * 0.18 +
      signal.visibilityImpact * 0.18 +
      signal.reviewMomentum * 0.16 +
      signal.postingActivity * 0.1 +
      signal.confidence * 0.1
  );
  const impactScore = applyTaskImpactFloor(signal, baseImpactScore);
  const urgencyScore = clampScore(signal.urgency);
  const confidenceScore = clampScore(signal.confidence);
  const effortPenalty = Math.min(signal.estimatedTimeMinutes * 0.8, 12);
  const weightedScore = clampScore(
    impactScore * 0.46 +
      urgencyScore * 0.27 +
      confidenceScore * 0.17 +
      (100 - effortPenalty) * 0.1 -
      signal.priorityRank * 1.4
  );

  return {
    id: signal.id,
    taskType: signal.taskType,
    title: signal.title,
    reason: signal.reason,
    suggestedAction: signal.suggestedAction,
    impactScore,
    urgencyScore,
    urgency: labelUrgency(urgencyScore),
    confidenceScore,
    estimatedTimeMinutes: signal.estimatedTimeMinutes,
    estimatedTime: `${signal.estimatedTimeMinutes} min`,
    requiresApproval: true,
    sourcePlatform: signal.sourcePlatform,
    source: sourceLabels[signal.sourcePlatform],
    relatedRecordId: signal.relatedRecordId,
    priorityRank: signal.priorityRank,
    weightedScore
  };
}

function compareGrowthTasks(a: GrowthTask, b: GrowthTask) {
  const priorityDelta =
    priorityOrder.indexOf(a.taskType) - priorityOrder.indexOf(b.taskType);

  if (priorityDelta !== 0 && Math.abs(a.weightedScore - b.weightedScore) < 10) {
    return priorityDelta;
  }

  return b.weightedScore - a.weightedScore || priorityDelta;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function applyTaskImpactFloor(signal: GrowthSignal, baseImpactScore: number) {
  const floors: Partial<Record<TaskType, number>> = {
    wasted_spend: signal.moneyImpact,
    negative_keyword_review: signal.moneyImpact,
    review_response: signal.reviewMomentum,
    review_request: signal.reviewMomentum,
    google_business_post: signal.visibilityImpact,
    photo_upload: signal.visibilityImpact,
    meta_post: signal.postingActivity,
    weekly_report: Math.max(signal.moneyImpact, signal.reviewMomentum),
    seo_cleanup: signal.seoImpact
  };

  return clampScore(Math.max(baseImpactScore, floors[signal.taskType] ?? 0));
}

function labelUrgency(score: number): GrowthTask["urgency"] {
  if (score >= 80) return "High";
  if (score >= 50) return "Medium";
  return "Low";
}

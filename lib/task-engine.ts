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

export type AiTaskLike = {
  task_type: TaskType;
  title: string;
  reason: string;
  suggested_action: string;
  impact_score: number;
  urgency_score: number;
  confidence_score: number;
  estimated_time_minutes: number;
  requires_approval: boolean;
  source_platform: SourcePlatform;
  related_record_id: string;
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

export function generateContextAwareFallbackStack(input: unknown): GrowthTask[] {
  const context = readFallbackContext(input);

  if (context.googleConnected || context.metaConnected) {
    if (!context.googleLiveSync && !context.metaLiveSync) {
      return [
        createSetupTask({
          id: "sync-google-first",
          taskType: "review_response",
          title: "Run the first Google sync",
          reason:
            "Google may be connected, but DreamGrowth still does not have a trusted live snapshot to work from.",
          suggestedAction:
            "Open Google Business and run Sync Google now before acting on reviews, posts, traffic, or ad insights.",
          impactScore: 90,
          urgencyScore: 88,
          confidenceScore: 97,
          sourcePlatform: "google_business",
          relatedRecordId: "sync-google-first"
        }),
        createSetupTask({
          id: "avoid-fake-ads",
          taskType: "wasted_spend",
          title: "Do not act on Google Ads recommendations yet",
          reason:
            "Google Ads live sync is not wired yet, so DreamGrowth should not claim wasted spend or negative keywords as fact.",
          suggestedAction:
            "Treat Ads, GA4, and Search Console as pending until their live syncs are built.",
          impactScore: 84,
          urgencyScore: 79,
          confidenceScore: 98,
          sourcePlatform: "google_ads",
          relatedRecordId: "avoid-fake-ads"
        }),
        createSetupTask({
          id: "sync-meta-if-needed",
          taskType: "meta_post",
          title: "Run the first Meta sync if you use Meta",
          reason:
            "Meta can already save account structure, but the workspace needs one sync before it can guide action honestly.",
          suggestedAction:
            "Open Meta and run Sync Meta now if Facebook or Instagram matters for this business.",
          impactScore: 62,
          urgencyScore: 48,
          confidenceScore: 94,
          sourcePlatform: "meta",
          relatedRecordId: "sync-meta-if-needed"
        }),
        createSetupTask({
          id: "use-growth-chat-carefully",
          taskType: "weekly_report",
          title: "Use Growth Chat for planning, not reporting",
          reason:
            "Without live sync, the safest use of DreamGrowth is workflow planning and setup guidance.",
          suggestedAction:
            "Ask for next steps, connection guidance, or drafts, but avoid treating missing data as confirmed performance.",
          impactScore: 70,
          urgencyScore: 58,
          confidenceScore: 96,
          sourcePlatform: "ai",
          relatedRecordId: "use-growth-chat-carefully"
        }),
        createSetupTask({
          id: "connect-ai-and-repeat",
          taskType: "photo_upload",
          title: "Retry Daily Stack after sync",
          reason:
            "Once Google sync succeeds, DreamGrowth can create more useful operator actions based on real workspace context.",
          suggestedAction:
            "Run Daily Stack again after the first live sync finishes.",
          impactScore: 60,
          urgencyScore: 50,
          confidenceScore: 94,
          sourcePlatform: "manual",
          relatedRecordId: "connect-ai-and-repeat"
        })
      ];
    }

    return createLiveFoundationTasks(context);
  }

  return [
    createSetupTask({
      id: "setup-google",
      taskType: "seo_cleanup",
      title: "Connect Google first",
      reason:
        "Google is the highest-value first connection because it unlocks reviews, Google Business activity, search terms, GA4, and Search Console signals.",
      suggestedAction:
        "Open Connect, save Google OAuth credentials if needed, then finish the Google connection flow.",
      impactScore: 95,
      urgencyScore: 94,
      confidenceScore: 98,
      sourcePlatform: "manual",
      relatedRecordId: "setup-google"
    }),
    createSetupTask({
      id: "setup-ai",
      taskType: "weekly_report",
      title: "Add your AI key",
      reason:
        "DreamGrowth becomes much more useful once Daily Stack and Growth Chat can rank actions instead of using only local fallback logic.",
      suggestedAction:
        "Choose Gemini or OpenAI in Settings and paste the API key for the provider you want to use.",
      impactScore: 84,
      urgencyScore: 82,
      confidenceScore: 96,
      sourcePlatform: "manual",
      relatedRecordId: "setup-ai"
    }),
    createSetupTask({
      id: "setup-meta",
      taskType: "meta_post",
      title: "Connect Meta only if you use it",
      reason:
        "Meta is optional, but it becomes valuable if you want Facebook, Instagram, or lead workflows in the same operator.",
      suggestedAction:
        "Add Meta credentials later if you use Facebook Pages, Instagram Business, or Meta lead forms.",
      impactScore: 58,
      urgencyScore: 40,
      confidenceScore: 88,
      sourcePlatform: "manual",
      relatedRecordId: "setup-meta"
    }),
    createSetupTask({
      id: "setup-security",
      taskType: "review_request",
      title: "Protect owner access before deployment",
      reason:
        "The app should not stay open once it is public, especially because it stores OAuth connections locally.",
      suggestedAction:
        "Set DREAMGROWTH_APP_PASSWORD and DREAMGROWTH_SESSION_SECRET, then restart the app before sharing it publicly.",
      impactScore: 76,
      urgencyScore: 68,
      confidenceScore: 94,
      sourcePlatform: "manual",
      relatedRecordId: "setup-security"
    }),
    createSetupTask({
      id: "setup-stack",
      taskType: "photo_upload",
      title: "Run Daily Stack again after setup",
      reason:
        "Once Google and AI are configured, DreamGrowth can produce more meaningful operator actions for the owner to approve.",
      suggestedAction:
        "Reconnect here after setup and re-open Daily Stack to get a ranked action list.",
      impactScore: 62,
      urgencyScore: 54,
      confidenceScore: 92,
      sourcePlatform: "manual",
      relatedRecordId: "setup-stack"
    })
  ];
}

export function normalizeAiTasks(tasks: AiTaskLike[]): GrowthTask[] {
  return tasks.map((task, index) => {
    const impactScore = clampScore(task.impact_score);
    const urgencyScore = clampScore(task.urgency_score);
    const confidenceScore = clampScore(task.confidence_score);

    return {
      id: task.related_record_id || `ai-task-${index + 1}`,
      taskType: task.task_type,
      title: task.title,
      reason: task.reason,
      suggestedAction: task.suggested_action,
      impactScore,
      urgencyScore,
      urgency: labelUrgency(urgencyScore),
      confidenceScore,
      estimatedTimeMinutes: task.estimated_time_minutes,
      estimatedTime: `${task.estimated_time_minutes} min`,
      requiresApproval: task.requires_approval,
      sourcePlatform: task.source_platform,
      source: sourceLabels[task.source_platform] ?? "AI Growth Brain",
      relatedRecordId: task.related_record_id,
      priorityRank: index + 1,
      weightedScore: clampScore(
        impactScore * 0.5 + urgencyScore * 0.3 + confidenceScore * 0.2
      )
    };
  });
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

function createSetupTask(input: {
  id: string;
  taskType: TaskType;
  title: string;
  reason: string;
  suggestedAction: string;
  impactScore: number;
  urgencyScore: number;
  confidenceScore: number;
  sourcePlatform: SourcePlatform;
  relatedRecordId: string;
}): GrowthTask {
  const urgencyScore = clampScore(input.urgencyScore);
  const impactScore = clampScore(input.impactScore);
  const confidenceScore = clampScore(input.confidenceScore);

  return {
    id: input.id,
    taskType: input.taskType,
    title: input.title,
    reason: input.reason,
    suggestedAction: input.suggestedAction,
    impactScore,
    urgencyScore,
    urgency: labelUrgency(urgencyScore),
    confidenceScore,
    estimatedTimeMinutes: 5,
    estimatedTime: "5 min",
    requiresApproval: false,
    sourcePlatform: input.sourcePlatform,
    source: sourceLabels[input.sourcePlatform],
    relatedRecordId: input.relatedRecordId,
    priorityRank: 0,
    weightedScore: clampScore(
      impactScore * 0.5 + urgencyScore * 0.3 + confidenceScore * 0.2
    )
  };
}

function readFallbackContext(input: unknown) {
  const value = input as {
    connection?: {
      googleConnected?: boolean;
      metaConnected?: boolean;
      googleLiveSync?: boolean;
      metaLiveSync?: boolean;
    };
    google?: {
      googleBusiness?: {
        reviews?: Array<{ id: string }>;
        postDrafts?: Array<{ id: string }>;
        metrics?: Array<{ value?: string }>;
      };
    };
    meta?: {
      facebookPages?: Array<{ id: string }>;
      instagramAccounts?: Array<{ id: string }>;
      leads?: Array<{ id: string }>;
      drafts?: Array<{ id: string }>;
    };
  };

  return {
    googleConnected: Boolean(value?.connection?.googleConnected),
    metaConnected: Boolean(value?.connection?.metaConnected),
    googleLiveSync: Boolean(value?.connection?.googleLiveSync),
    metaLiveSync: Boolean(value?.connection?.metaLiveSync),
    googleReviews: value?.google?.googleBusiness?.reviews?.length ?? 0,
    googlePostDrafts: value?.google?.googleBusiness?.postDrafts?.length ?? 0,
    metaPages: value?.meta?.facebookPages?.length ?? 0,
    metaInstagramAccounts: value?.meta?.instagramAccounts?.length ?? 0,
    metaLeads: value?.meta?.leads?.length ?? 0,
    metaDrafts: value?.meta?.drafts?.length ?? 0
  };
}

function createLiveFoundationTasks(
  context: ReturnType<typeof readFallbackContext>
) {
  const tasks: GrowthTask[] = [];

  if (context.googleLiveSync && context.googleReviews > 0) {
    tasks.push(
      createSetupTask({
        id: "review-live-google-reviews",
        taskType: "review_response",
        title: `Review ${context.googleReviews} synced Google review${context.googleReviews === 1 ? "" : "s"}`,
        reason:
          "DreamGrowth now has live Google review data, so owner follow-up can be based on real customer feedback.",
        suggestedAction:
          "Open Google Business and review the synced reviews before drafting or approving replies.",
        impactScore: 88,
        urgencyScore: 83,
        confidenceScore: 95,
        sourcePlatform: "google_business",
        relatedRecordId: "review-live-google-reviews"
      })
    );
  }

  if (context.googleLiveSync && context.googlePostDrafts > 0) {
    tasks.push(
      createSetupTask({
        id: "review-live-google-posts",
        taskType: "google_business_post",
        title: `Review ${context.googlePostDrafts} Google Business draft${context.googlePostDrafts === 1 ? "" : "s"}`,
        reason:
          "There is now real Google Business location context available for post review.",
        suggestedAction:
          "Open Google Business and confirm the post draft matches the right location and project.",
        impactScore: 74,
        urgencyScore: 66,
        confidenceScore: 92,
        sourcePlatform: "google_business",
        relatedRecordId: "review-live-google-posts"
      })
    );
  }

  if (context.metaLiveSync && context.metaPages > 0) {
    tasks.push(
      createSetupTask({
        id: "review-live-meta-foundation",
        taskType: "meta_post",
        title: `Review ${context.metaPages} synced Meta Page${context.metaPages === 1 ? "" : "s"}`,
        reason:
          "Meta account structure is now live, so the workspace can be verified before content or lead tools are added.",
        suggestedAction:
          "Open Meta and confirm the connected Pages and Instagram accounts are the right ones.",
        impactScore: 61,
        urgencyScore: 52,
        confidenceScore: 93,
        sourcePlatform: "meta",
        relatedRecordId: "review-live-meta-foundation"
      })
    );
  }

  tasks.push(
    createSetupTask({
      id: "ads-live-pending",
      taskType: "wasted_spend",
      title: "Keep Google Ads insights in pending mode",
      reason:
        "DreamGrowth still does not have Google Ads live sync, so any ad optimization should be treated as manual review work only.",
      suggestedAction:
        "Do not approve ad-budget or negative-keyword recommendations here until the Ads sync layer is built.",
      impactScore: 82,
      urgencyScore: 76,
      confidenceScore: 98,
      sourcePlatform: "google_ads",
      relatedRecordId: "ads-live-pending"
    })
  );

  return tasks.slice(0, 5);
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

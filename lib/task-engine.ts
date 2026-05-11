import type {
  GoogleBusinessPostDraft,
  GoogleBusinessReview,
  GoogleIntegrationSummary
} from "@/lib/google/types";
import {
  getGoogleSyncDiagnostic,
  getGoogleSyncDiagnosticTitle
} from "@/lib/google/sync-diagnostics";
import { getMeaningfulConnectionName } from "@/lib/integrations/display-name";
import type { IntegrationConnection } from "@/lib/integrations/store";
import type { MetaIntegrationSummary } from "@/lib/meta/types";

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
  | "seo_cleanup"
  | "google_connection"
  | "google_sync"
  | "location_verification"
  | "product_boundary";

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
  statusLabel: string;
  actionLabel: string;
  actionHref: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  deliveryMode: "manual" | "sync" | "setup" | "pending";
  disclaimer: string;
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

export type DailyStackResult = {
  mode:
    | "google_not_connected"
    | "google_scope_needed"
    | "google_sync_blocked"
    | "google_sync_needed"
    | "google_live";
  tasks: GrowthTask[];
  note: string;
  approvalRule: string;
  summary: {
    googleConnected: boolean;
    googleBusinessScope: boolean;
    googleLiveSync: boolean;
    googleDisplayName: string | null;
    reviewCount: number;
    lowRatingReviewCount: number;
    postDraftCount: number;
    locationCount: number;
    lastSyncAt: string | null;
    pendingLanes: string[];
  };
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

type OperatorDailyStackInput = {
  google: GoogleIntegrationSummary;
  meta: MetaIntegrationSummary;
  googleConnection: IntegrationConnection;
  metaConnection: IntegrationConnection;
};

type OperatorContext = {
  googleConnected: boolean;
  googleBusinessScope: boolean;
  googleLiveSync: boolean;
  googleDisplayName: string | null;
  reviewCount: number;
  lowRatingReviewCount: number;
  pendingReviewCount: number;
  postDraftCount: number;
  locationCount: number;
  lastSyncAt: string | null;
  reviews: GoogleBusinessReview[];
  postDrafts: GoogleBusinessPostDraft[];
  pendingLanes: string[];
};

const GOOGLE_BUSINESS_SCOPE = "https://www.googleapis.com/auth/business.manage";
const DEFAULT_APPROVAL_RULE =
  "DreamGrowth ranks and drafts the work. The owner still reviews, approves, and completes every external step manually.";

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
  "google_sync",
  "google_connection",
  "location_verification",
  "review_response",
  "google_business_post",
  "photo_upload",
  "review_request",
  "wasted_spend",
  "negative_keyword_review",
  "meta_post",
  "weekly_report",
  "seo_cleanup",
  "lead_follow_up",
  "product_boundary"
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
  return rankTasks(signals.map(toGrowthTask).sort(compareGrowthTasks).slice(0, 5));
}

export function buildOperatorDailyStack(
  input: OperatorDailyStackInput
): DailyStackResult {
  const context = readOperatorContext(input);
  const summary = {
    googleConnected: context.googleConnected,
    googleBusinessScope: context.googleBusinessScope,
    googleLiveSync: context.googleLiveSync,
    googleDisplayName: context.googleDisplayName,
    reviewCount: context.reviewCount,
    lowRatingReviewCount: context.lowRatingReviewCount,
    postDraftCount: context.postDraftCount,
    locationCount: context.locationCount,
    lastSyncAt: context.lastSyncAt,
    pendingLanes: context.pendingLanes
  };

  if (!context.googleConnected) {
    return {
      mode: "google_not_connected",
      tasks: rankTasks([
        createSetupTask({
          id: "google-connect-owner",
          taskType: "google_connection",
          title: "Connect the owner Google account",
          reason:
            "Daily Stack only becomes trustworthy once DreamGrowth can read a real Google Business connection for this workspace.",
          suggestedAction:
            "Open Settings and complete the Google connect flow before expecting review or post work here.",
          impactScore: 97,
          urgencyScore: 94,
          confidenceScore: 99,
          sourcePlatform: "manual",
          relatedRecordId: "google-connect-owner",
          estimatedTimeMinutes: 4,
          statusLabel: "Setup required",
          actionLabel: "Open Settings",
          actionHref: "/settings",
          secondaryActionLabel: "Open Connect",
          secondaryActionHref: "/connect",
          deliveryMode: "setup",
          disclaimer:
            "This is setup only. DreamGrowth will not invent Google Business actions before a real connection exists."
        }),
        createPendingLaneTask(context)
      ]),
      note:
        "Daily Stack is in setup mode. It will not claim Google Business work until the owner account is connected.",
      approvalRule: DEFAULT_APPROVAL_RULE,
      summary
    };
  }

  if (!context.googleBusinessScope) {
    return {
      mode: "google_scope_needed",
      tasks: rankTasks([
        createSetupTask({
          id: "google-business-scope-missing",
          taskType: "google_connection",
          title: "Reconnect Google with Business access",
          reason:
            "The Google account is saved, but the Google Business permission is missing, so reviews and profile work should not be ranked as live data yet.",
          suggestedAction:
            "Open Settings, reconnect Google, and approve the Google Business access request.",
          impactScore: 95,
          urgencyScore: 92,
          confidenceScore: 99,
          sourcePlatform: "google_business",
          relatedRecordId: "google-business-scope-missing",
          estimatedTimeMinutes: 5,
          statusLabel: "Reconnect required",
          actionLabel: "Reconnect in Settings",
          actionHref: "/settings",
          secondaryActionLabel: "Open Connect",
          secondaryActionHref: "/connect",
          deliveryMode: "setup",
          disclaimer:
            "Until Business access is restored, DreamGrowth should not present reviews or Google Business drafts as current work."
        }),
        createSetupTask({
          id: "google-sync-after-reconnect",
          taskType: "google_sync",
          title: "Run the first sync right after reconnecting",
          reason:
            "The next trustworthy stack appears only after Google Business accounts, locations, and reviews are pulled into the workspace.",
          suggestedAction:
            "After reconnecting, open Google Business and run Sync Google now once.",
          impactScore: 84,
          urgencyScore: 80,
          confidenceScore: 98,
          sourcePlatform: "google_business",
          relatedRecordId: "google-sync-after-reconnect",
          estimatedTimeMinutes: 3,
          statusLabel: "Blocked on reconnect",
          actionLabel: "Open Google Business",
          actionHref: "/google-business",
          secondaryActionLabel: "Reconnect Google",
          secondaryActionHref: "/settings",
          deliveryMode: "sync",
          disclaimer:
            "No live Google tasks should be approved until the reconnect and first sync both succeed."
        }),
        createPendingLaneTask(context)
      ]),
      note:
        "Google is connected, but Google Business access is missing. Daily Stack is showing the next corrective steps, not live operator work.",
      approvalRule: DEFAULT_APPROVAL_RULE,
      summary
    };
  }

  if (!context.googleLiveSync) {
    const googleSyncDiagnostic = getGoogleSyncDiagnostic(input.googleConnection);

    if (googleSyncDiagnostic) {
      return {
        mode: "google_sync_blocked",
        tasks: rankTasks([
          createSetupTask({
            id: "google-sync-blocked",
            taskType: "google_sync",
            title:
              getGoogleSyncDiagnosticTitle(googleSyncDiagnostic) ??
              "Fix the Google sync blocker",
            reason: googleSyncDiagnostic.message,
            suggestedAction: googleSyncDiagnostic.hint,
            impactScore: 95,
            urgencyScore: 93,
            confidenceScore: 99,
            sourcePlatform: "google_business",
            relatedRecordId: `google-sync-blocked-${googleSyncDiagnostic.reason}`,
            estimatedTimeMinutes: 5,
            statusLabel: "Blocked externally",
            actionLabel: "Open connection help",
            actionHref: "/connect",
            secondaryActionLabel: "Open Google Business",
            secondaryActionHref: "/google-business",
            deliveryMode: "setup",
            disclaimer:
              "DreamGrowth is holding back review and post work until this external Google blocker is resolved and a live sync succeeds."
          }),
          createSetupTask({
            id: "google-review-blocker-details",
            taskType: "location_verification",
            title: "Review the exact Google blocker details",
            reason:
              `Current sync stage: ${googleSyncDiagnostic.stage}. Google returned status ${googleSyncDiagnostic.status ?? "unknown"} for this workspace.`,
            suggestedAction:
              googleSyncDiagnostic.helpUrl
                ? "Use the Google API setup link inside Connect or Google Business, then retry the sync."
                : "Use the Connect page to review the blocker details, then retry the sync once the Google-side setup is fixed.",
            impactScore: 82,
            urgencyScore: 79,
            confidenceScore: 98,
            sourcePlatform: "google_business",
            relatedRecordId: "google-review-blocker-details",
            estimatedTimeMinutes: 3,
            statusLabel: "Needs owner attention",
            actionLabel: "Open Connect",
            actionHref: "/connect",
            secondaryActionLabel: "Open Google Business",
            secondaryActionHref: "/google-business",
            deliveryMode: "setup",
            disclaimer:
              "This is still setup work. No Google Business review or post should be treated as live until the sync succeeds."
          }),
          createPendingLaneTask(context)
        ]),
        note:
          "Google is connected, but a real Google-side blocker is preventing the first sync. Daily Stack is surfacing the fix instead of pretending the live operator queue exists already.",
        approvalRule: DEFAULT_APPROVAL_RULE,
        summary
      };
    }

    return {
      mode: "google_sync_needed",
      tasks: rankTasks([
        createSetupTask({
          id: "google-first-sync",
          taskType: "google_sync",
          title: "Run the first live Google sync",
          reason:
            "The account is connected, but no Google Business snapshot is stored yet, so Daily Stack cannot rank reviews or posts from live data.",
          suggestedAction:
            "Open Google Business and run Sync Google now before acting on reviews, posts, or profile activity.",
          impactScore: 94,
          urgencyScore: 90,
          confidenceScore: 99,
          sourcePlatform: "google_business",
          relatedRecordId: "google-first-sync",
          estimatedTimeMinutes: 3,
          statusLabel: "Sync required",
          actionLabel: "Open Google Business",
          actionHref: "/google-business",
          secondaryActionLabel: "Review connection",
          secondaryActionHref: "/settings",
          deliveryMode: "sync",
          disclaimer:
            "Until that first sync finishes, DreamGrowth should stay in setup mode instead of pretending it has real Google Business work."
        }),
        createSetupTask({
          id: "google-verify-owner-before-sync",
          taskType: "location_verification",
          title: "Verify the connected Google owner account",
          reason:
            getMeaningfulConnectionName(context.googleDisplayName)
              ? `Google is currently connected as ${getMeaningfulConnectionName(
                  context.googleDisplayName
                )}. Confirm that this is the right owner account before syncing locations and reviews.`
              : "Confirm the connected owner account before syncing locations and reviews into the workspace.",
          suggestedAction:
            "Open Settings if the wrong Google account is linked, otherwise continue into Google Business and sync.",
          impactScore: 76,
          urgencyScore: 71,
          confidenceScore: 96,
          sourcePlatform: "google_business",
          relatedRecordId: "google-verify-owner-before-sync",
          estimatedTimeMinutes: 2,
          statusLabel: "Verify before sync",
          actionLabel: "Open Settings",
          actionHref: "/settings",
          secondaryActionLabel: "Open Google Business",
          secondaryActionHref: "/google-business",
          deliveryMode: "setup",
          disclaimer:
            "The first live snapshot should come from the right owner account so Daily Stack stays focused on the correct listing."
        }),
        createPendingLaneTask(context)
      ]),
      note:
        "Google is connected, but the first live Google Business snapshot is still missing. Daily Stack is showing honest next steps until the sync lands.",
      approvalRule: DEFAULT_APPROVAL_RULE,
      summary
    };
  }

  return {
    mode: "google_live",
    tasks: buildLiveGoogleTasks(context),
    note: buildLiveNote(context),
    approvalRule: DEFAULT_APPROVAL_RULE,
    summary
  };
}

export function generateContextAwareFallbackStack(input: unknown): GrowthTask[] {
  const context = readFallbackContext(input);

  if (context.googleConnected || context.metaConnected) {
    if (!context.googleLiveSync && !context.metaLiveSync) {
      return rankTasks([
        createSetupTask({
          id: "sync-google-first",
          taskType: "google_sync",
          title: "Run the first Google sync",
          reason:
            "Google may be connected, but DreamGrowth still does not have a trusted live snapshot to work from.",
          suggestedAction:
            "Open Google Business and run Sync Google now before acting on reviews, posts, traffic, or ad insights.",
          impactScore: 90,
          urgencyScore: 88,
          confidenceScore: 97,
          sourcePlatform: "google_business",
          relatedRecordId: "sync-google-first",
          actionLabel: "Open Google Business",
          actionHref: "/google-business",
          deliveryMode: "sync"
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
          relatedRecordId: "avoid-fake-ads",
          deliveryMode: "pending"
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
          relatedRecordId: "sync-meta-if-needed",
          actionLabel: "Open Meta",
          actionHref: "/meta",
          deliveryMode: "pending"
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
          relatedRecordId: "connect-ai-and-repeat",
          actionLabel: "Return to Daily Stack",
          actionHref: "/daily-stack"
        })
      ]);
    }

    return createLiveFoundationTasks(context);
  }

  return rankTasks([
    createSetupTask({
      id: "setup-google",
      taskType: "google_connection",
      title: "Connect Google first",
      reason:
        "Google is the highest-value first connection because it unlocks reviews, Google Business activity, search terms, GA4, and Search Console signals.",
      suggestedAction:
        "Open Connect, save Google OAuth credentials if needed, then finish the Google connection flow.",
      impactScore: 95,
      urgencyScore: 94,
      confidenceScore: 98,
      sourcePlatform: "manual",
      relatedRecordId: "setup-google",
      actionLabel: "Open Settings",
      actionHref: "/settings",
      secondaryActionLabel: "Open Connect",
      secondaryActionHref: "/connect",
      deliveryMode: "setup"
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
      relatedRecordId: "setup-ai",
      actionLabel: "Open Settings",
      actionHref: "/settings",
      deliveryMode: "setup"
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
      relatedRecordId: "setup-meta",
      actionLabel: "Open Settings",
      actionHref: "/settings",
      deliveryMode: "pending"
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
      relatedRecordId: "setup-security",
      actionLabel: "Open Settings",
      actionHref: "/settings",
      deliveryMode: "setup"
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
      relatedRecordId: "setup-stack",
      actionLabel: "Return to Daily Stack",
      actionHref: "/daily-stack"
    })
  ]);
}

export function normalizeAiTasks(tasks: AiTaskLike[]): GrowthTask[] {
  return rankTasks(
    tasks.map((task, index) => {
      const impactScore = clampScore(task.impact_score);
      const urgencyScore = clampScore(task.urgency_score);
      const confidenceScore = clampScore(task.confidence_score);

      return createGrowthTask({
        id: task.related_record_id || `ai-task-${index + 1}`,
        taskType: task.task_type,
        title: task.title,
        reason: task.reason,
        suggestedAction: task.suggested_action,
        impactScore,
        urgencyScore,
        confidenceScore,
        estimatedTimeMinutes: task.estimated_time_minutes,
        requiresApproval: task.requires_approval,
        sourcePlatform: task.source_platform,
        relatedRecordId: task.related_record_id,
        priorityRank: index + 1,
        weightedScore: clampScore(
          impactScore * 0.5 + urgencyScore * 0.3 + confidenceScore * 0.2
        )
      });
    })
  );
}

function buildLiveGoogleTasks(context: OperatorContext) {
  const tasks: GrowthTask[] = [];
  const lowRatingReviews = context.reviews.filter(
    (review) => review.rating <= 3 && review.responseStatus !== "published"
  );
  const standardReviews = context.reviews.filter(
    (review) => review.rating > 3 && review.responseStatus !== "published"
  );
  const syncAgeHours = getAgeHours(context.lastSyncAt);

  if (syncAgeHours !== null && syncAgeHours >= 48) {
    tasks.push(
      createGrowthTask({
        id: "google-refresh-live-snapshot",
        taskType: "google_sync",
        title: "Refresh the Google Business snapshot",
        reason: `The latest sync is ${formatAge(syncAgeHours)} old. Refresh it before approving replies or post work so Daily Stack ranks from current Google Business data.`,
        suggestedAction:
          "Open Google Business, run Sync Google now, then come back here to review the refreshed stack.",
        impactScore: syncAgeHours >= 168 ? 90 : 78,
        urgencyScore: syncAgeHours >= 168 ? 93 : 82,
        confidenceScore: 99,
        estimatedTimeMinutes: 3,
        requiresApproval: false,
        sourcePlatform: "google_business",
        relatedRecordId: "google-refresh-live-snapshot",
        weightedScore: clampScore(syncAgeHours >= 168 ? 94 : 84),
        statusLabel: "Refresh before review",
        actionLabel: "Open Google Business",
        actionHref: "/google-business",
        deliveryMode: "sync",
        disclaimer:
          "DreamGrowth can only rank honestly from the snapshot currently stored in the Google Business workspace."
      })
    );
  }

  if (lowRatingReviews.length > 0) {
    const freshestLowRatingHours = getNewestSignalAgeHours(lowRatingReviews);
    const freshnessBoost =
      freshestLowRatingHours !== null && freshestLowRatingHours <= 48 ? 6 : 0;

    tasks.push(
      createGrowthTask({
        id: "google-low-rating-review-queue",
        taskType: "review_response",
        title: `Review ${lowRatingReviews.length} low-rating Google ${pluralize("review", lowRatingReviews.length)}`,
        reason: `The live Google Business snapshot includes ${lowRatingReviews.length} review${lowRatingReviews.length === 1 ? "" : "s"} rated 3 stars or lower${describeFreshness(
          freshestLowRatingHours
        )}. Handle these first because they can change trust quickly.`,
        suggestedAction:
          "Open Reviews, tighten the drafted replies, then copy the final responses into Google Business manually.",
        impactScore: clampScore(88 + Math.min(lowRatingReviews.length * 4, 8)),
        urgencyScore: clampScore(88 + freshnessBoost),
        confidenceScore: 98,
        estimatedTimeMinutes: Math.max(4, lowRatingReviews.length * 4),
        requiresApproval: true,
        sourcePlatform: "google_business",
        relatedRecordId: "google-low-rating-review-queue",
        weightedScore: clampScore(93 + freshnessBoost),
        statusLabel: "Ready in Reviews",
        actionLabel: "Open Reviews",
        actionHref: "/reviews",
        secondaryActionLabel: "Refine in Growth Chat",
        secondaryActionHref: "/growth-chat",
        deliveryMode: "manual",
        disclaimer:
          "DreamGrowth can draft the response, but the owner still posts it manually in Google Business."
      })
    );
  }

  if (standardReviews.length > 0) {
    const freshestStandardHours = getNewestSignalAgeHours(standardReviews);
    const freshnessBoost =
      freshestStandardHours !== null && freshestStandardHours <= 48 ? 4 : 0;

    tasks.push(
      createGrowthTask({
        id: "google-review-response-queue",
        taskType: "review_response",
        title: `Review ${standardReviews.length} additional Google response ${pluralize("draft", standardReviews.length)}`,
        reason: `The live snapshot still has ${standardReviews.length} synced review${standardReviews.length === 1 ? "" : "s"} waiting on an owner-approved reply${describeFreshness(
          freshestStandardHours
        )}.`,
        suggestedAction:
          "Open Reviews, approve or refine the drafts, then post the final responses manually in Google Business.",
        impactScore: clampScore(74 + Math.min(standardReviews.length * 3, 10)),
        urgencyScore: clampScore(68 + freshnessBoost),
        confidenceScore: 97,
        estimatedTimeMinutes: Math.max(3, standardReviews.length * 3),
        requiresApproval: true,
        sourcePlatform: "google_business",
        relatedRecordId: "google-review-response-queue",
        weightedScore: clampScore(82 + freshnessBoost),
        statusLabel: "Ready in Reviews",
        actionLabel: "Open Reviews",
        actionHref: "/reviews",
        secondaryActionLabel: "Open Google Business",
        secondaryActionHref: "/google-business",
        deliveryMode: "manual",
        disclaimer:
          "Replies stay owner-reviewed. DreamGrowth does not auto-post them into Google Business."
      })
    );
  }

  if (context.postDraftCount > 0) {
    tasks.push(
      createGrowthTask({
        id: "google-business-post-review",
        taskType: "google_business_post",
        title: `Review ${context.postDraftCount} Google Business post ${pluralize("draft", context.postDraftCount)}`,
        reason:
          context.postDraftCount === 1
            ? "A Google Business draft is already waiting inside the live workflow."
            : "Multiple Google Business drafts are already waiting inside the live workflow.",
        suggestedAction:
          "Open Google Business, confirm the location and wording, then publish manually when the owner is satisfied.",
        impactScore: clampScore(70 + Math.min(context.postDraftCount * 4, 8)),
        urgencyScore: 65,
        confidenceScore: 95,
        estimatedTimeMinutes: Math.max(4, context.postDraftCount * 4),
        requiresApproval: true,
        sourcePlatform: "google_business",
        relatedRecordId: "google-business-post-review",
        weightedScore: 78,
        statusLabel: "Ready in Google Business",
        actionLabel: "Open Google Business",
        actionHref: "/google-business",
        secondaryActionLabel: "Open Content Workflow",
        secondaryActionHref: "/content",
        deliveryMode: "manual",
        disclaimer:
          "DreamGrowth can queue the draft, but publishing still happens manually in Google Business."
      })
    );
  } else {
    tasks.push(
      createGrowthTask({
        id: "google-business-post-gap",
        taskType: "google_business_post",
        title: "No Google Business post draft is ready yet",
        reason:
          "The live layer is still focused on locations and reviews first, so there is no synced Google Business draft to approve today.",
        suggestedAction:
          "Open Google Business to confirm the location context, then use a recent project photo to plan the next post manually.",
        impactScore: 54,
        urgencyScore: 39,
        confidenceScore: 96,
        estimatedTimeMinutes: 6,
        requiresApproval: false,
        sourcePlatform: "google_business",
        relatedRecordId: "google-business-post-gap",
        weightedScore: 52,
        statusLabel: "No live draft yet",
        actionLabel: "Open Google Business",
        actionHref: "/google-business",
        secondaryActionLabel: "Use Growth Chat",
        secondaryActionHref: "/growth-chat",
        deliveryMode: "manual",
        disclaimer:
          "Posting support is still guided. DreamGrowth does not publish Google Business posts automatically."
      })
    );
  }

  if (context.reviewCount === 0) {
    tasks.push(
      createGrowthTask({
        id: "google-review-sync-check",
        taskType: "location_verification",
        title: "Check why no Google reviews were returned",
        reason: `The live sync completed, but this workspace currently shows 0 visible reviews across ${context.locationCount} synced ${pluralize(
          "location",
          context.locationCount
        )}. Daily Stack should pause review work until the listing access is confirmed.`,
        suggestedAction:
          "Open Google Business, confirm the right listing is connected, and rerun sync if reviews should already exist.",
        impactScore: 76,
        urgencyScore: 74,
        confidenceScore: 97,
        estimatedTimeMinutes: 5,
        requiresApproval: false,
        sourcePlatform: "google_business",
        relatedRecordId: "google-review-sync-check",
        weightedScore: 79,
        statusLabel: "Investigate live sync",
        actionLabel: "Open Google Business",
        actionHref: "/google-business",
        deliveryMode: "manual",
        disclaimer:
          "DreamGrowth can only rank review work from the locations and reviews returned by the live Google snapshot."
      })
    );
  }

  if (context.locationCount > 1) {
    tasks.push(
      createGrowthTask({
        id: "google-location-focus-check",
        taskType: "location_verification",
        title: `Confirm which ${context.locationCount} Google ${pluralize("location", context.locationCount)} should drive Daily Stack`,
        reason:
          "The live sync found multiple locations. Verify the primary listing focus before spreading review or post work across the wrong profile.",
        suggestedAction:
          "Open Google Business and confirm the connected locations and owner priority before approving more work.",
        impactScore: 62,
        urgencyScore: 57,
        confidenceScore: 95,
        estimatedTimeMinutes: 4,
        requiresApproval: false,
        sourcePlatform: "google_business",
        relatedRecordId: "google-location-focus-check",
        weightedScore: 60,
        statusLabel: "Verify live foundation",
        actionLabel: "Open Google Business",
        actionHref: "/google-business",
        deliveryMode: "manual",
        disclaimer:
          "The stack stays most useful when one real Google Business location lane is clearly in focus."
      })
    );
  }

  if (tasks.length < 4) {
    tasks.push(createPendingLaneTask(context));
  }

  return rankTasks(tasks.sort((a, b) => b.weightedScore - a.weightedScore).slice(0, 5));
}

function createPendingLaneTask(context: {
  pendingLanes: string[];
}): GrowthTask {
  return createGrowthTask({
    id: "google-boundary-pending-lanes",
    taskType: "product_boundary",
    title: `Keep ${joinLabels(context.pendingLanes)} in pending mode`,
    reason:
      "Daily Stack is intentionally ranking only from Google Business connection and live sync signals right now.",
    suggestedAction:
      "Finish the Google connect-sync-review loop before letting other channels compete for attention here.",
    impactScore: 42,
    urgencyScore: 24,
    confidenceScore: 99,
    estimatedTimeMinutes: 1,
    requiresApproval: false,
    sourcePlatform: "manual",
    relatedRecordId: "google-boundary-pending-lanes",
    weightedScore: 38,
    statusLabel: "Pending lanes",
    actionLabel: "Open Dashboard",
    actionHref: "/dashboard",
    deliveryMode: "pending",
    disclaimer:
      "Other channels stay visible only as product boundaries. They are not ranked from live Daily Stack signals yet."
  });
}

function buildLiveNote(context: OperatorContext) {
  const liveSnapshot = context.lastSyncAt
    ? `Using the latest Google Business snapshot from ${formatDate(context.lastSyncAt)}`
    : "Using the latest stored Google Business snapshot";

  return `${liveSnapshot}: ${context.reviewCount} ${pluralize("review", context.reviewCount)}, ${context.postDraftCount} post ${pluralize(
    "draft",
    context.postDraftCount
  )}, ${context.locationCount} ${pluralize("location", context.locationCount)}. DreamGrowth can rank the work, but every external change is still manual.`;
}

function readOperatorContext(input: OperatorDailyStackInput): OperatorContext {
  const reviewCount = input.google.googleBusiness.reviews.length;
  const lowRatingReviewCount = input.google.googleBusiness.reviews.filter(
    (review) => review.rating <= 3 && review.responseStatus !== "published"
  ).length;
  const pendingReviewCount = input.google.googleBusiness.reviews.filter(
    (review) => review.responseStatus !== "published"
  ).length;
  const postDraftCount = input.google.googleBusiness.postDrafts.filter(
    (draft) => draft.status !== "scheduled"
  ).length;

  return {
    googleConnected: input.googleConnection.isConnected,
    googleBusinessScope: input.googleConnection.scopes.includes(
      GOOGLE_BUSINESS_SCOPE
    ),
    googleLiveSync: Boolean(input.googleConnection.metadata.liveSync),
    googleDisplayName: input.googleConnection.displayName,
    reviewCount,
    lowRatingReviewCount,
    pendingReviewCount,
    postDraftCount,
    locationCount: readLocationCount(input.google, input.googleConnection),
    lastSyncAt: input.googleConnection.lastSyncAt,
    reviews: input.google.googleBusiness.reviews,
    postDrafts: input.google.googleBusiness.postDrafts,
    pendingLanes: buildPendingLanes(input.meta, input.metaConnection)
  };
}

function readLocationCount(
  google: GoogleIntegrationSummary,
  connection: IntegrationConnection
) {
  const metadataCount = toNumber(connection.metadata.locationCount);

  if (metadataCount !== null) {
    return metadataCount;
  }

  const metric = google.googleBusiness.metrics.find(
    (item) => item.label.toLowerCase() === "locations"
  );

  return toNumber(metric?.value) ?? 0;
}

function buildPendingLanes(
  meta: MetaIntegrationSummary,
  metaConnection: IntegrationConnection
) {
  const lanes = ["Google Ads", "GA4", "Search Console"];

  if (
    metaConnection.isConnected ||
    meta.facebookPages.length > 0 ||
    meta.instagramAccounts.length > 0 ||
    meta.adAccounts.length > 0
  ) {
    lanes.push("Meta");
  } else {
    lanes.push("Meta");
  }

  return lanes;
}

function toNumber(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? parsed : null;
}

function getNewestSignalAgeHours(items: Array<{ createdAt: string }>) {
  const newestTimestamp = items.reduce<number | null>((latest, item) => {
    const timestamp = new Date(item.createdAt).getTime();

    if (!Number.isFinite(timestamp)) {
      return latest;
    }

    return latest === null || timestamp > latest ? timestamp : latest;
  }, null);

  if (newestTimestamp === null) {
    return null;
  }

  return Math.max(0, Math.round((Date.now() - newestTimestamp) / 3_600_000));
}

function getAgeHours(value: string | null) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();

  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return Math.max(0, Math.round((Date.now() - timestamp) / 3_600_000));
}

function formatAge(hours: number) {
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}

function describeFreshness(hours: number | null) {
  if (hours === null) {
    return "";
  }

  if (hours < 24) {
    return `, with the newest one from the last ${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const days = Math.round(hours / 24);
  return `, with the newest one from the last ${days} day${days === 1 ? "" : "s"}`;
}

function formatDate(value: string) {
  const timestamp = new Date(value);

  if (!Number.isFinite(timestamp.getTime())) {
    return value;
  }

  return timestamp.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function joinLabels(values: string[]) {
  if (values.length <= 1) {
    return values[0] ?? "other lanes";
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function pluralize(word: string, count: number) {
  return count === 1 ? word : `${word}s`;
}

function rankTasks(tasks: GrowthTask[]) {
  return tasks.map((task, index) => ({
    ...task,
    priorityRank: index + 1
  }));
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

  return createGrowthTask({
    id: signal.id,
    taskType: signal.taskType,
    title: signal.title,
    reason: signal.reason,
    suggestedAction: signal.suggestedAction,
    impactScore,
    urgencyScore,
    confidenceScore,
    estimatedTimeMinutes: signal.estimatedTimeMinutes,
    requiresApproval: true,
    sourcePlatform: signal.sourcePlatform,
    relatedRecordId: signal.relatedRecordId,
    priorityRank: signal.priorityRank,
    weightedScore
  });
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
  estimatedTimeMinutes?: number;
  statusLabel?: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  deliveryMode?: GrowthTask["deliveryMode"];
  disclaimer?: string;
}): GrowthTask {
  const urgencyScore = clampScore(input.urgencyScore);
  const impactScore = clampScore(input.impactScore);
  const confidenceScore = clampScore(input.confidenceScore);

  return createGrowthTask({
    id: input.id,
    taskType: input.taskType,
    title: input.title,
    reason: input.reason,
    suggestedAction: input.suggestedAction,
    impactScore,
    urgencyScore,
    confidenceScore,
    estimatedTimeMinutes: input.estimatedTimeMinutes ?? 5,
    requiresApproval: false,
    sourcePlatform: input.sourcePlatform,
    relatedRecordId: input.relatedRecordId,
    priorityRank: 0,
    weightedScore: clampScore(
      impactScore * 0.5 + urgencyScore * 0.3 + confidenceScore * 0.2
    ),
    statusLabel: input.statusLabel,
    actionLabel: input.actionLabel,
    actionHref: input.actionHref,
    secondaryActionLabel: input.secondaryActionLabel,
    secondaryActionHref: input.secondaryActionHref,
    deliveryMode: input.deliveryMode,
    disclaimer: input.disclaimer
  });
}

function createGrowthTask(input: {
  id: string;
  taskType: TaskType;
  title: string;
  reason: string;
  suggestedAction: string;
  impactScore: number;
  urgencyScore: number;
  confidenceScore: number;
  estimatedTimeMinutes: number;
  requiresApproval: boolean;
  sourcePlatform: SourcePlatform;
  relatedRecordId: string;
  priorityRank?: number;
  weightedScore?: number;
  statusLabel?: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  deliveryMode?: GrowthTask["deliveryMode"];
  disclaimer?: string;
}): GrowthTask {
  const urgencyScore = clampScore(input.urgencyScore);
  const impactScore = clampScore(input.impactScore);
  const confidenceScore = clampScore(input.confidenceScore);
  const defaults = getTaskActionDefaults(input.taskType);
  const deliveryMode = input.deliveryMode ?? defaults.deliveryMode;

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
    estimatedTimeMinutes: input.estimatedTimeMinutes,
    estimatedTime: `${input.estimatedTimeMinutes} min`,
    requiresApproval: input.requiresApproval,
    sourcePlatform: input.sourcePlatform,
    source: sourceLabels[input.sourcePlatform] ?? "AI Growth Brain",
    relatedRecordId: input.relatedRecordId,
    priorityRank: input.priorityRank ?? 0,
    weightedScore:
      input.weightedScore ??
      clampScore(impactScore * 0.5 + urgencyScore * 0.3 + confidenceScore * 0.2),
    statusLabel:
      input.statusLabel ?? defaultStatusLabel(input.taskType, deliveryMode),
    actionLabel: input.actionLabel ?? defaults.actionLabel,
    actionHref: input.actionHref ?? defaults.actionHref,
    secondaryActionLabel:
      input.secondaryActionLabel ?? defaults.secondaryActionLabel,
    secondaryActionHref:
      input.secondaryActionHref ?? defaults.secondaryActionHref,
    deliveryMode,
    disclaimer:
      input.disclaimer ??
      defaultDisclaimer(input.taskType, deliveryMode, input.requiresApproval)
  };
}

function getTaskActionDefaults(taskType: TaskType) {
  switch (taskType) {
    case "review_response":
      return {
        actionLabel: "Open Reviews",
        actionHref: "/reviews",
        secondaryActionLabel: "Refine in Growth Chat",
        secondaryActionHref: "/growth-chat",
        deliveryMode: "manual" as const
      };
    case "google_business_post":
      return {
        actionLabel: "Open Google Business",
        actionHref: "/google-business",
        secondaryActionLabel: "Open Content Workflow",
        secondaryActionHref: "/content",
        deliveryMode: "manual" as const
      };
    case "photo_upload":
      return {
        actionLabel: "Open Media",
        actionHref: "/media",
        secondaryActionLabel: "Open Google Business",
        secondaryActionHref: "/google-business",
        deliveryMode: "manual" as const
      };
    case "meta_post":
    case "lead_follow_up":
      return {
        actionLabel: "Open Meta",
        actionHref: "/meta",
        deliveryMode: "pending" as const
      };
    case "wasted_spend":
    case "negative_keyword_review":
      return {
        actionLabel: "Open Google Ads",
        actionHref: "/google-ads",
        deliveryMode: "pending" as const
      };
    case "review_request":
      return {
        actionLabel: "Open Reviews",
        actionHref: "/reviews",
        secondaryActionLabel: "Open Growth Chat",
        secondaryActionHref: "/growth-chat",
        deliveryMode: "manual" as const
      };
    case "weekly_report":
      return {
        actionLabel: "Open Weekly Report",
        actionHref: "/weekly-report",
        deliveryMode: "manual" as const
      };
    case "seo_cleanup":
      return {
        actionLabel: "Open Growth Chat",
        actionHref: "/growth-chat",
        deliveryMode: "manual" as const
      };
    case "google_connection":
      return {
        actionLabel: "Open Settings",
        actionHref: "/settings",
        secondaryActionLabel: "Open Connect",
        secondaryActionHref: "/connect",
        deliveryMode: "setup" as const
      };
    case "google_sync":
    case "location_verification":
      return {
        actionLabel: "Open Google Business",
        actionHref: "/google-business",
        secondaryActionLabel: "Review connection",
        secondaryActionHref: "/settings",
        deliveryMode: taskType === "google_sync" ? ("sync" as const) : ("manual" as const)
      };
    case "product_boundary":
      return {
        actionLabel: "Open Dashboard",
        actionHref: "/dashboard",
        deliveryMode: "pending" as const
      };
    default:
      return {
        actionLabel: "Open Daily Stack",
        actionHref: "/daily-stack",
        deliveryMode: "manual" as const
      };
  }
}

function defaultStatusLabel(
  taskType: TaskType,
  deliveryMode: GrowthTask["deliveryMode"]
) {
  if (deliveryMode === "setup") {
    return "Setup required";
  }

  if (deliveryMode === "sync") {
    return taskType === "google_sync" ? "Sync required" : "Refresh required";
  }

  if (deliveryMode === "pending") {
    return "Pending lane";
  }

  switch (taskType) {
    case "review_response":
      return "Ready in Reviews";
    case "google_business_post":
      return "Ready in Google Business";
    case "location_verification":
      return "Ready for verification";
    default:
      return "Ready now";
  }
}

function defaultDisclaimer(
  taskType: TaskType,
  deliveryMode: GrowthTask["deliveryMode"],
  requiresApproval: boolean
) {
  if (deliveryMode === "setup") {
    return "This is a setup step only. DreamGrowth is not acting on live Google data yet.";
  }

  if (deliveryMode === "sync") {
    return "Run sync first. Daily Stack should not rank stale or missing Google Business data as current work.";
  }

  if (deliveryMode === "pending") {
    return "This lane is intentionally pending. It is not ranked from live Daily Stack signals yet.";
  }

  if (taskType === "review_response") {
    return "DreamGrowth can draft the response, but the owner still posts it manually in Google Business.";
  }

  if (taskType === "google_business_post") {
    return "DreamGrowth can help review the draft, but publishing still happens manually in Google Business.";
  }

  if (!requiresApproval) {
    return "This is a manual owner step. DreamGrowth is surfacing the work, not executing it.";
  }

  return "Owner approval is still required before any external change happens.";
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
        title: `Review ${context.googleReviews} synced Google ${pluralize("review", context.googleReviews)}`,
        reason:
          "DreamGrowth now has live Google review data, so owner follow-up can be based on real customer feedback.",
        suggestedAction:
          "Open Reviews and review the synced drafts before posting anything manually in Google Business.",
        impactScore: 88,
        urgencyScore: 83,
        confidenceScore: 95,
        sourcePlatform: "google_business",
        relatedRecordId: "review-live-google-reviews",
        actionLabel: "Open Reviews",
        actionHref: "/reviews"
      })
    );
  }

  if (context.googleLiveSync && context.googlePostDrafts > 0) {
    tasks.push(
      createSetupTask({
        id: "review-live-google-posts",
        taskType: "google_business_post",
        title: `Review ${context.googlePostDrafts} Google Business ${pluralize("draft", context.googlePostDrafts)}`,
        reason:
          "There is now real Google Business location context available for post review.",
        suggestedAction:
          "Open Google Business and confirm the post draft matches the right location and project.",
        impactScore: 74,
        urgencyScore: 66,
        confidenceScore: 92,
        sourcePlatform: "google_business",
        relatedRecordId: "review-live-google-posts",
        actionLabel: "Open Google Business",
        actionHref: "/google-business"
      })
    );
  }

  if (context.metaLiveSync && context.metaPages > 0) {
    tasks.push(
      createSetupTask({
        id: "review-live-meta-foundation",
        taskType: "meta_post",
        title: `Review ${context.metaPages} synced Meta ${pluralize("Page", context.metaPages)}`,
        reason:
          "Meta account structure is now live, so the workspace can be verified before content or lead tools are added.",
        suggestedAction:
          "Open Meta and confirm the connected Pages and Instagram accounts are the right ones.",
        impactScore: 61,
        urgencyScore: 52,
        confidenceScore: 93,
        sourcePlatform: "meta",
        relatedRecordId: "review-live-meta-foundation",
        actionLabel: "Open Meta",
        actionHref: "/meta",
        deliveryMode: "pending"
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
      relatedRecordId: "ads-live-pending",
      deliveryMode: "pending"
    })
  );

  return rankTasks(tasks.slice(0, 5));
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

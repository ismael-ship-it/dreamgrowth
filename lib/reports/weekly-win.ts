import { getIntegrationConnection } from "@/lib/integrations/store";
import type { WeeklyWinReport } from "@/lib/reports/types";

export function getWeeklyWinReport(): WeeklyWinReport {
  const google = getIntegrationConnection("google");
  const meta = getIntegrationConnection("meta");

  if (!google.isConnected && !meta.isConnected) {
    return {
      id: "weekly-win-setup-needed",
      mode: "setup_needed",
      note:
        "Weekly reporting stays empty until at least one marketing platform is connected.",
      weekStart: "Connect Google first",
      weekEnd: "Then add Meta if you use it",
      headline:
        "Connect Google or Meta to turn DreamGrowth into a real weekly win report instead of a mock dashboard.",
      moneySaved: 0,
      reviewsGained: 0,
      postsPublished: 0,
      photosUploaded: 0,
      visibilityImprovement: "0%",
      callsTrend: "Connect Google",
      directionsTrend: "Connect Google",
      websiteClicksTrend: "Connect GA4",
      completedTasks: [
        "Add Google OAuth credentials in Settings",
        "Connect your Google account",
        "Optionally connect Meta for Pages, Instagram, and leads"
      ],
      metrics: [
        {
          label: "Google",
          value: "Not connected",
          detail: "required for reviews, ads, GA4, and Search Console"
        },
        {
          label: "Meta",
          value: "Optional",
          detail: "connect if you use Facebook, Instagram, or Meta leads"
        },
        {
          label: "Weekly report",
          value: "Waiting",
          detail: "needs at least one connected platform"
        },
        {
          label: "Proof of value",
          value: "0",
          detail: "real wins start after connection"
        },
        {
          label: "Tasks completed",
          value: "0",
          detail: "operator workflow not started yet"
        },
        {
          label: "Data mode",
          value: "Setup",
          detail: "no live platform is connected"
        }
      ]
    };
  }

  const connectedProviders = [google, meta]
    .filter((provider) => provider.isConnected)
    .map((provider) => provider.provider)
    .join(" + ");
  const moneySaved = 86;
  const postsPublished = 3;

  return {
    id: "weekly-win-2026-05-11",
    mode: "sample_connected",
    note: `Connected platforms: ${connectedProviders}. Weekly totals remain sample workflow data until live sync is implemented.`,
    weekStart: "2026-05-04",
    weekEnd: "2026-05-10",
    headline: `This week DreamGrowth helped you save $${moneySaved} in wasted ad spend and publish ${postsPublished} local project posts.`,
    moneySaved,
    reviewsGained: 7,
    postsPublished,
    photosUploaded: 9,
    visibilityImprovement: "+18%",
    callsTrend: "+12%",
    directionsTrend: "+3",
    websiteClicksTrend: "+18%",
    completedTasks: [
      "Reviewed 5 wasted Google Ads search terms",
      "Approved 3 negative keyword suggestions",
      "Responded to 4 Google reviews",
      "Uploaded 9 real project photos",
      "Published 3 local project posts"
    ],
    metrics: [
      {
        label: "Money Saved",
        value: `$${moneySaved}`,
        detail: "from avoided wasted searches"
      },
      {
        label: "Reviews Gained",
        value: "7",
        detail: "new review momentum"
      },
      {
        label: "Posts Published",
        value: String(postsPublished),
        detail: "from real project photos"
      },
      {
        label: "Photos Uploaded",
        value: "9",
        detail: "fresh local proof"
      },
      {
        label: "Visibility",
        value: "+18%",
        detail: "profile actions trend"
      },
      {
        label: "Calls",
        value: "+12%",
        detail: "vs previous week"
      }
    ]
  };
}

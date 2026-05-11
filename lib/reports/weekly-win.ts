import type { WeeklyWinReport } from "@/lib/reports/types";

export function getWeeklyWinReport(): WeeklyWinReport {
  const moneySaved = 86;
  const postsPublished = 3;

  return {
    id: "weekly-win-2026-05-11",
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

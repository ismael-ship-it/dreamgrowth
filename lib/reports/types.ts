export type WeeklyWinMetric = {
  label: string;
  value: string;
  detail: string;
};

export type WeeklyWinTrend = {
  label: string;
  value: string;
  icon: "phone" | "route" | "click" | "store" | "users" | "megaphone";
};

export type WeeklyWinReport = {
  id: string;
  mode: "setup_needed" | "guided_connected" | "partial_live";
  note: string;
  weekStart: string;
  weekEnd: string;
  headline: string;
  moneySaved: number;
  reviewsGained: number;
  postsPublished: number;
  photosUploaded: number;
  visibilityImprovement: string;
  callsTrend: string;
  directionsTrend: string;
  websiteClicksTrend: string;
  completedTasks: string[];
  metrics: WeeklyWinMetric[];
  trendTitle: string;
  trends: WeeklyWinTrend[];
};

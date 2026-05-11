export type WeeklyWinMetric = {
  label: string;
  value: string;
  detail: string;
};

export type WeeklyWinReport = {
  id: string;
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
};

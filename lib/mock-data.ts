import {
  Banknote,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  MessageSquareText,
  SearchCheck,
  ShieldAlert,
  Star,
  TrendingUp
} from "lucide-react";
import {
  generateDailyGrowthStack,
  mockGrowthSignals
} from "@/lib/task-engine";

export const growthTasks = generateDailyGrowthStack(mockGrowthSignals);

export const dashboardStats = [
  {
    label: "Money Saved",
    value: "$86",
    detail: "from blocked waste",
    icon: Banknote
  },
  {
    label: "Reviews Gained",
    value: "7",
    detail: "this month",
    icon: Star
  },
  {
    label: "Visibility Momentum",
    value: "+18%",
    detail: "profile actions",
    icon: TrendingUp
  },
  {
    label: "Pending Approvals",
    value: "4",
    detail: "ready for you",
    icon: Clock3
  },
  {
    label: "Wasted Spend Alerts",
    value: "5",
    detail: "searches to review",
    icon: ShieldAlert
  },
  {
    label: "Posts Ready",
    value: "3",
    detail: "from real photos",
    icon: MessageSquareText
  }
];

export const moduleSummaries = {
  "/google-business": {
    title: "Google Business",
    description:
      "Reviews, photos, posts, calls, directions, and local profile activity.",
    items: ["1 review needs a reply", "3 photos suggested", "Post draft ready"]
  },
  "/google-ads": {
    title: "Google Ads Sentinel",
    description:
      "Find wasted spend and suggest negative keywords before more budget leaks.",
    items: [
      "$42 flagged this week",
      "5 terms need review",
      "3 negative keywords suggested"
    ]
  },
  "/campaign-builder": {
    title: "Campaign Builder",
    description:
      "Create Google Ads campaign drafts for calls, website leads, and showroom visits with owner approval before publishing.",
    items: [
      "Draft campaigns only",
      "Phrase and exact match first",
      "Negative keyword protection required"
    ]
  },
  "/meta": {
    title: "Meta",
    description:
      "Facebook, Instagram, Meta ads, lead capture, and future inbox readiness.",
    items: ["2 draft captions", "1 lead needs follow-up", "Instagram connected"]
  },
  "/reviews": {
    title: "Reviews",
    description: "Get more reviews, respond faster, and protect local trust.",
    items: ["2 customers to ask", "1 reply pending", "Average rating 4.8"]
  },
  "/content": {
    title: "Content",
    description:
      "Turn real project photos into local posts without generic AI fluff.",
    items: ["3 posts ready", "6 project photos unused", "2 cities mentioned"]
  },
  "/calendar": {
    title: "Calendar",
    description:
      "A simple approval calendar for local project posts and reminders.",
    items: ["2 scheduled posts", "1 GBP post tomorrow", "Weekly report Friday"]
  },
  "/weekly-report": {
    title: "Weekly Win Report",
    description:
      "Simple proof of value: money saved, reviews gained, posts published, photos uploaded, and local visibility momentum.",
    items: ["$86 saved", "7 reviews gained", "3 local posts published"]
  },
  "/settings": {
    title: "Settings",
    description:
      "Manage company, users, integrations, approvals, and connected accounts.",
    items: ["Google connected", "Meta connected", "Approval workflow on"]
  }
};

export const quickActions = [
  { label: "Approve posts", icon: CheckCircle2 },
  { label: "Upload photos", icon: Camera },
  { label: "Review spend", icon: CircleDollarSign },
  { label: "Check visibility", icon: SearchCheck }
];

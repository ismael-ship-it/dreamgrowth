import type { SourcePlatform, TaskType } from "@/lib/task-engine";

export type AiGeneratedTask = {
  task_type: TaskType;
  title: string;
  reason: string;
  suggested_action: string;
  impact_score: number;
  urgency_score: number;
  confidence_score: number;
  estimated_time_minutes: number;
  requires_approval: true;
  source_platform: SourcePlatform;
  related_record_id: string;
};

export type AiDailyStackResponse = {
  tasks: AiGeneratedTask[];
};

export const dailyStackJsonSchema = {
  name: "daily_growth_stack",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["tasks"],
    properties: {
      tasks: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "task_type",
            "title",
            "reason",
            "suggested_action",
            "impact_score",
            "urgency_score",
            "confidence_score",
            "estimated_time_minutes",
            "requires_approval",
            "source_platform",
            "related_record_id"
          ],
          properties: {
            task_type: {
              type: "string",
              enum: [
                "wasted_spend",
                "negative_keyword_review",
                "review_response",
                "review_request",
                "google_business_post",
                "photo_upload",
                "meta_post",
                "lead_follow_up",
                "weekly_report",
                "seo_cleanup"
              ]
            },
            title: { type: "string" },
            reason: { type: "string" },
            suggested_action: { type: "string" },
            impact_score: { type: "integer" },
            urgency_score: { type: "integer" },
            confidence_score: { type: "integer" },
            estimated_time_minutes: { type: "integer" },
            requires_approval: { type: "boolean" },
            source_platform: {
              type: "string",
              enum: [
                "google_business",
                "google_ads",
                "ga4",
                "search_console",
                "meta",
                "facebook",
                "instagram",
                "manual",
                "ai"
              ]
            },
            related_record_id: { type: "string" }
          }
        }
      }
    }
  }
} as const;

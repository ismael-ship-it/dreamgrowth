export type ContentPlatform = "google_business" | "facebook" | "instagram";

export type ProjectMediaInput = {
  id: string;
  fileName: string;
  city?: string;
  state?: string;
  materialType?: string;
  serviceType?: string;
  notes?: string;
  projectDate?: string;
};

export type GeneratedPostDraft = {
  id: string;
  mediaId: string;
  platform: ContentPlatform;
  title: string;
  body: string;
  hashtags: string[];
  status: "pending_approval";
  warnings: string[];
  sourceFacts: {
    city?: string;
    state?: string;
    materialType?: string;
    serviceType?: string;
    notes?: string;
  };
};

export type ContentGenerationRequest = {
  media: ProjectMediaInput;
  platforms: ContentPlatform[];
};

export type ContentGenerationResult = {
  drafts: GeneratedPostDraft[];
  approvalRule: string;
};

import { getCompanyProfile } from "@/lib/company/profile";
import type {
  ContentGenerationRequest,
  ContentGenerationResult,
  ContentPlatform,
  GeneratedPostDraft,
  ProjectMediaInput
} from "@/lib/content/types";
import { listUploadedMedia } from "@/lib/media/service";

const forbiddenPhrases = [
  "transform your dream kitchen",
  "elevate your space",
  "stunning craftsmanship"
] as const;

const contentApprovalRule =
  "Draft generation uses stored project facts only. Owner review is required, and Google Business posting is still manual outside DreamGrowth.";

const projectFactLabels = [
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "materialType", label: "Material" },
  { key: "serviceType", label: "Service" },
  { key: "notes", label: "Notes" },
  { key: "projectDate", label: "Project date" }
] as const satisfies ReadonlyArray<{
  key: keyof ProjectMediaInput;
  label: string;
}>;

export type ContentEngineStepStatus = "ready" | "attention" | "manual";

export type ContentEngineStep = {
  id: string;
  title: string;
  detail: string;
  status: ContentEngineStepStatus;
};

export type ContentEngineSnapshot = {
  mediaLibrary: ProjectMediaInput[];
  mediaLibraryMode: "local_uploads" | "empty";
  selectedMedia: ProjectMediaInput | null;
  result: ContentGenerationResult;
  factCoverage: {
    provided: number;
    total: number;
    summary: string;
  };
  selectionReason: string;
  libraryDisclosure: string;
  manualPublishingNote: string;
  workflow: ContentEngineStep[];
  googleBusinessChecklist: string[];
};

export async function getProjectMediaLibrary() {
  const uploadedMedia = listUploadedMedia().map((upload) => ({
    id: upload.id,
    fileName: upload.fileName,
    city: upload.city,
    state: upload.state,
    materialType: normalizeContentValue(upload.materialType),
    serviceType: normalizeContentValue(upload.serviceType),
    notes: upload.notes,
    projectDate: upload.projectDate
  })) satisfies ProjectMediaInput[];

  return uploadedMedia;
}

export async function getContentEngineSnapshot(): Promise<ContentEngineSnapshot> {
  const mediaLibrary = await getProjectMediaLibrary();
  const selectedMedia = selectFeaturedProject(mediaLibrary);
  const result = selectedMedia
    ? await generateContentDrafts({
        media: selectedMedia,
        platforms: ["google_business", "facebook", "instagram"]
      })
    : {
        drafts: [],
        approvalRule: contentApprovalRule
      };
  const factCoverage = getFactCoverage(selectedMedia);

  return {
    mediaLibrary,
    mediaLibraryMode: mediaLibrary.length ? "local_uploads" : "empty",
    selectedMedia,
    result,
    factCoverage,
    selectionReason: selectedMedia
      ? "DreamGrowth is using the uploaded media record with the strongest location, service, material, notes, and date coverage for the first fact-based Google Business draft."
      : "No uploaded project media records are available yet, so the content engine cannot build a fact-based draft.",
    libraryDisclosure:
      mediaLibrary.length
        ? "These drafts come from the local media library saved in this DreamGrowth workspace."
        : "No uploaded media has been saved in this workspace yet.",
    manualPublishingNote:
      "DreamGrowth does not publish to Google Business from this screen yet. After approval, someone still needs to review the copy and post it manually in Google Business Profile.",
    workflow: buildWorkflow(selectedMedia, factCoverage),
    googleBusinessChecklist: buildGoogleBusinessChecklist(selectedMedia)
  };
}

export async function generateContentDrafts(
  request: ContentGenerationRequest
): Promise<ContentGenerationResult> {
  const profile = getCompanyProfile();
  const drafts = request.platforms.map((platform) =>
    buildDraft(request.media, platform, profile)
  );

  return {
    drafts,
    approvalRule: contentApprovalRule
  };
}

export async function generateDraftsForFirstProject() {
  const featuredMedia = selectFeaturedProject(await getProjectMediaLibrary());

  if (!featuredMedia) {
    return {
      drafts: [],
      approvalRule: contentApprovalRule
    };
  }

  return generateContentDrafts({
    media: featuredMedia,
    platforms: ["google_business", "facebook", "instagram"]
  });
}

function buildDraft(
  media: ProjectMediaInput,
  platform: ContentPlatform,
  profile: ReturnType<typeof getCompanyProfile>
): GeneratedPostDraft {
  const cleanBody = removeForbiddenPhrases(buildBody(media, platform, profile));

  return {
    id: `draft-${platform}-${media.id}`,
    mediaId: media.id,
    platform,
    title: titleForPlatform(platform, media),
    body: cleanBody,
    hashtags: hashtagsForPlatform(platform, media),
    status: "pending_approval",
    warnings: validateMediaFacts(media, platform),
    sourceFacts: {
      city: media.city,
      state: media.state,
      materialType: media.materialType,
      serviceType: media.serviceType,
      notes: media.notes
    }
  };
}

function buildBody(
  media: ProjectMediaInput,
  platform: ContentPlatform,
  profile: ReturnType<typeof getCompanyProfile>
) {
  const location = formatLocation(media);
  const projectDate = formatProjectDate(media.projectDate);
  const projectLabel = buildProjectLabel(media);
  const sentenceProjectLabel = lowercaseFirstCharacter(projectLabel);
  const noteText = media.notes ? ` Team note: ${ensureSentence(media.notes)}` : "";
  const cta = buildCta(profile, media);
  const dateText = projectDate ? ` logged ${projectDate}` : "";
  const locationText = location ? ` in ${location}` : "";

  if (platform === "google_business") {
    const intro = isShowroomMedia(media)
      ? `Showroom photo${dateText}${locationText} featuring ${withArticle(sentenceProjectLabel)}.`
      : `Project photo${dateText} for ${withArticle(sentenceProjectLabel)}${locationText}.`;

    return `${intro}${noteText} ${cta}`;
  }

  if (platform === "facebook") {
    return `Real project media${locationText} tied to ${withArticle(sentenceProjectLabel)}.${noteText} ${cta}`;
  }

  return `Real project photo${locationText}: ${sentenceProjectLabel}.${noteText} ${cta}`;
}

function validateMediaFacts(media: ProjectMediaInput, platform: ContentPlatform) {
  const warnings: string[] = [];

  if (!media.city) {
    warnings.push("City missing. Local wording will stay broader than ideal.");
  }

  if (!media.materialType) {
    warnings.push("Material missing. The copy will avoid surface-specific claims.");
  }

  if (!media.serviceType) {
    warnings.push("Service missing. The post will stay generic.");
  }

  if (!media.projectDate) {
    warnings.push("Project date missing. Recency wording stays generic.");
  }

  if (isShowroomMedia(media)) {
    warnings.push(
      "This record reads like showroom or pre-fabrication media, so the draft avoids completed-install language."
    );
  }

  if (platform === "google_business") {
    warnings.push("Google Business publishing is still manual from DreamGrowth.");
  }

  return warnings;
}

function titleForPlatform(platform: ContentPlatform, media: ProjectMediaInput) {
  const location = formatLocation(media);
  const projectLabel = buildProjectLabel(media);
  const locationText = location ? ` in ${location}` : "";

  if (platform === "google_business") {
    return `${capitalizePlatform(platform)} draft: ${projectLabel}${locationText}`;
  }

  if (platform === "facebook") {
    return `Recent ${projectLabel}${locationText}`;
  }

  return `${projectLabel}${locationText}`;
}

function hashtagsForPlatform(platform: ContentPlatform, media: ProjectMediaInput) {
  if (platform === "google_business") return [];

  return [media.city, media.materialType, media.serviceType]
    .filter(Boolean)
    .map((value) => `#${String(value).replace(/[^a-zA-Z0-9]/g, "")}`);
}

function buildWorkflow(
  media: ProjectMediaInput | null,
  factCoverage: ContentEngineSnapshot["factCoverage"]
): ContentEngineStep[] {
  return [
    {
      id: "media",
      title: "Capture a real project photo",
      detail: media
        ? "A real uploaded media record is available now for drafting."
        : "No media record is available yet, so the flow is blocked before drafting.",
      status: media ? "ready" : "attention"
    },
    {
      id: "facts",
      title: "Confirm the project facts",
      detail: media
        ? `${factCoverage.summary} The draft only uses facts already attached to the record.`
        : "Add at least location, service, material, and a short note to make the draft credible.",
      status:
        media && factCoverage.provided >= 5
          ? "ready"
          : media
            ? "attention"
            : "attention"
    },
    {
      id: "draft",
      title: "Review the Google Business draft",
      detail: media
        ? "DreamGrowth can prepare the copy, but a human still needs to check tone, accuracy, and whether the photo is the right one."
        : "No draft can be generated until a usable project record exists.",
      status: media ? "ready" : "attention"
    },
    {
      id: "publish",
      title: "Post manually after approval",
      detail:
        "There is no live Google Business publishing from this page yet, so posting still happens manually after review.",
      status: "manual"
    }
  ];
}

function normalizeContentValue(value?: string) {
  if (!value) {
    return value;
  }

  return value.trim().toLowerCase();
}

function buildGoogleBusinessChecklist(media: ProjectMediaInput | null) {
  if (!media) {
    return [
      "Upload a project photo and attach the city, material, service, and a short field note.",
      "Come back once the media record is ready to generate a draft."
    ];
  }

  return [
    "Confirm the photo actually matches the city and service tags before posting.",
    media.notes
      ? "Keep or trim the team note so every sentence can be verified from the real job."
      : "Add a short factual note so the draft can sound specific without guessing.",
    "Paste the approved copy into Google Business Profile manually until direct publishing exists."
  ];
}

function selectFeaturedProject(mediaLibrary: ProjectMediaInput[]) {
  return (
    [...mediaLibrary]
      .sort((left, right) => scoreProjectMedia(right) - scoreProjectMedia(left))
      .at(0) ?? null
  );
}

function scoreProjectMedia(media: ProjectMediaInput) {
  let score = 0;

  if (media.city) score += 2;
  if (media.state) score += 1;
  if (media.materialType) score += 2;
  if (media.serviceType) score += 2;
  if (media.notes) score += 2;
  if (media.projectDate) score += 1;

  return score;
}

function getFactCoverage(media: ProjectMediaInput | null) {
  if (!media) {
    return {
      provided: 0,
      total: projectFactLabels.length,
      summary: "0 of 6 core project facts available."
    };
  }

  const provided = projectFactLabels.filter(({ key }) => {
    const value = media[key];
    return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
  }).length;
  const total = projectFactLabels.length;

  return {
    provided,
    total,
    summary: `${provided} of ${total} core project facts available.`
  };
}

function buildProjectLabel(media: ProjectMediaInput) {
  if (isShowroomMedia(media)) {
    if (media.materialType) {
      return `${capitalize(media.materialType)} showroom slab`;
    }

    return "showroom slab";
  }

  const service = media.serviceType ?? "stone project";

  if (media.materialType) {
    return `${capitalize(media.materialType)} ${service}`;
  }

  return service;
}

function buildCta(
  profile: ReturnType<typeof getCompanyProfile>,
  media: ProjectMediaInput
) {
  const companyName = profile.companyName;
  const service = media.serviceType
    ? lowercaseFirstCharacter(media.serviceType)
    : "stone project";

  if (isShowroomMedia(media)) {
    return `Contact ${companyName} if you want help planning your next ${service}.`;
  }

  return `Contact ${companyName} if you want to talk through a similar ${service}.`;
}

function formatLocation(media: Pick<ProjectMediaInput, "city" | "state">) {
  return [media.city, media.state].filter(Boolean).join(", ");
}

function formatProjectDate(value?: string) {
  if (!value) return null;

  const parsed = new Date(`${value}T12:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(parsed);
}

function isShowroomMedia(media: ProjectMediaInput) {
  const haystack = `${media.serviceType ?? ""} ${media.notes ?? ""}`.toLowerCase();
  return haystack.includes("showroom") || haystack.includes("before fabrication");
}

function ensureSentence(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function withArticle(value: string) {
  const article = /^[aeiou]/i.test(value) ? "an" : "a";
  return `${article} ${value}`;
}

function capitalizePlatform(platform: ContentPlatform) {
  return platform
    .split("_")
    .map((part) => capitalize(part))
    .join(" ");
}

function removeForbiddenPhrases(body: string) {
  return normalizeWhitespace(
    forbiddenPhrases.reduce(
      (cleaned, phrase) => cleaned.replace(new RegExp(phrase, "gi"), ""),
      body
    )
  );
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function lowercaseFirstCharacter(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

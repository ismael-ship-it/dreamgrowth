import { projectMediaLibrary } from "@/lib/content/mock-data";
import { getCompanyProfile } from "@/lib/company/profile";
import type {
  ContentGenerationRequest,
  ContentGenerationResult,
  ContentPlatform,
  GeneratedPostDraft,
  ProjectMediaInput
} from "@/lib/content/types";

const forbiddenPhrases = [
  "transform your dream kitchen",
  "elevate your space",
  "stunning craftsmanship"
];

export async function getProjectMediaLibrary() {
  return projectMediaLibrary;
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
    approvalRule:
      "AI-generated posts are drafts only. Owner approval is required before scheduling or publishing."
  };
}

export async function generateDraftsForFirstProject() {
  return generateContentDrafts({
    media: projectMediaLibrary[0],
    platforms: ["google_business", "facebook", "instagram"]
  });
}

function buildDraft(
  media: ProjectMediaInput,
  platform: ContentPlatform,
  profile: ReturnType<typeof getCompanyProfile>
): GeneratedPostDraft {
  const warnings = validateMediaFacts(media);
  const location = [media.city, media.state].filter(Boolean).join(", ");
  const service = media.serviceType ?? "project";
  const material = media.materialType;
  const locationText = location ? ` in ${location}` : "";
  const materialText = material ? `${capitalize(material)} ` : "";
  const serviceText = `${materialText}${service}`;
  const noteText = media.notes ? ` ${media.notes}` : "";

  const cta = profile.callsToAction[0] ?? "Contact us";
  const baseSentence = `Recent ${serviceText}${locationText}.`;
  const bodyByPlatform: Record<ContentPlatform, string> = {
    google_business: `${baseSentence}${noteText} ${cta} if you are planning a local ${service}.`,
    facebook: `${baseSentence}${noteText} This is a real project photo from ${profile.companyName}.`,
    instagram: `${baseSentence}${noteText} ${cta}.`
  };
  const cleanBody = removeForbiddenPhrases(bodyByPlatform[platform]);

  return {
    id: `draft-${platform}-${media.id}`,
    mediaId: media.id,
    platform,
    title: titleForPlatform(platform, media),
    body: cleanBody,
    hashtags: hashtagsForPlatform(platform, media),
    status: "pending_approval",
    warnings,
    sourceFacts: {
      city: media.city,
      state: media.state,
      materialType: media.materialType,
      serviceType: media.serviceType,
      notes: media.notes
    }
  };
}

function validateMediaFacts(media: ProjectMediaInput) {
  const warnings: string[] = [];

  if (!media.city) {
    warnings.push("City missing. Local SEO wording will be weaker.");
  }

  if (!media.materialType) {
    warnings.push("Material missing. The post will avoid material claims.");
  }

  if (!media.serviceType) {
    warnings.push("Service missing. The post will stay generic.");
  }

  return warnings;
}

function titleForPlatform(platform: ContentPlatform, media: ProjectMediaInput) {
  const material = media.materialType ? `${capitalize(media.materialType)} ` : "";
  const service = media.serviceType ?? "project";
  const city = media.city ? ` in ${media.city}` : "";

  if (platform === "instagram") {
    return `${material}${service}${city}`;
  }

  if (platform === "facebook") {
    return `Recent ${material}${service}${city}`;
  }

  return `${material}${service}${city}`;
}

function hashtagsForPlatform(platform: ContentPlatform, media: ProjectMediaInput) {
  if (platform === "google_business") return [];

  return [media.city, media.materialType, media.serviceType]
    .filter(Boolean)
    .map((value) => `#${String(value).replace(/[^a-zA-Z0-9]/g, "")}`);
}

function removeForbiddenPhrases(body: string) {
  return forbiddenPhrases.reduce(
    (cleaned, phrase) => cleaned.replace(new RegExp(phrase, "gi"), ""),
    body
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

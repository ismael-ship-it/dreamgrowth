import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { defaultCompanyProfile } from "@/lib/company/dreamstoneworks";

export type CompanyProfile = {
  companyName: string;
  website: string;
  phone: string;
  email: string;
  primaryCity: string;
  primaryState: string;
  showroom: string;
  fabricationShop: string;
  industry: string;
  tone: string;
  services: string[];
  serviceAreas: string[];
  callsToAction: string[];
  rules: string[];
};

export type CompanyProfileInput = Omit<CompanyProfile, "services" | "serviceAreas" | "callsToAction" | "rules"> & {
  services: string[];
  serviceAreas: string[];
  callsToAction: string[];
  rules: string[];
};

const storageDir = join(process.cwd(), ".dreamgrowth");
const storagePath = join(storageDir, "company-profile.json");

export function getCompanyProfile(): CompanyProfile {
  ensureStorageDir();

  if (!existsSync(storagePath)) {
    return defaultCompanyProfile;
  }

  try {
    const raw = readFileSync(storagePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<CompanyProfile>;

    return mergeWithDefault(parsed);
  } catch {
    return defaultCompanyProfile;
  }
}

export function saveCompanyProfile(input: CompanyProfileInput) {
  ensureStorageDir();
  const next = mergeWithDefault(input);
  writeFileSync(storagePath, JSON.stringify(next, null, 2), "utf8");
  return next;
}

function mergeWithDefault(input: Partial<CompanyProfile>): CompanyProfile {
  return {
    companyName: sanitizeText(input.companyName, defaultCompanyProfile.companyName),
    website: sanitizeText(input.website, defaultCompanyProfile.website),
    phone: sanitizeText(input.phone, defaultCompanyProfile.phone),
    email: sanitizeText(input.email, defaultCompanyProfile.email),
    primaryCity: sanitizeText(input.primaryCity, defaultCompanyProfile.primaryCity),
    primaryState: sanitizeText(input.primaryState, defaultCompanyProfile.primaryState),
    showroom: sanitizeText(input.showroom, defaultCompanyProfile.showroom),
    fabricationShop: sanitizeText(
      input.fabricationShop,
      defaultCompanyProfile.fabricationShop
    ),
    industry: sanitizeText(input.industry, defaultCompanyProfile.industry),
    tone: sanitizeText(input.tone, defaultCompanyProfile.tone),
    services: sanitizeList(input.services, defaultCompanyProfile.services),
    serviceAreas: sanitizeList(input.serviceAreas, defaultCompanyProfile.serviceAreas),
    callsToAction: sanitizeList(
      input.callsToAction,
      defaultCompanyProfile.callsToAction
    ),
    rules: sanitizeList(input.rules, defaultCompanyProfile.rules)
  };
}

function sanitizeText(value: string | undefined, fallback: string) {
  return value?.trim() || fallback;
}

function sanitizeList(value: string[] | undefined, fallback: string[]) {
  const cleaned =
    value
      ?.map((entry) => entry.trim())
      .filter(Boolean)
      .filter((entry, index, entries) => entries.indexOf(entry) === index) ?? [];

  return cleaned.length ? cleaned : fallback;
}

function ensureStorageDir() {
  if (!existsSync(storageDir)) {
    mkdirSync(storageDir, { recursive: true });
  }
}

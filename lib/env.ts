type ServerEnvKey =
  | "DREAMGROWTH_APP_PASSWORD"
  | "DREAMGROWTH_SESSION_SECRET"
  | "OPENAI_API_KEY"
  | "OPENAI_MODEL"
  | "AI_PROVIDER"
  | "GEMINI_API_KEY"
  | "GEMINI_MODEL"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "GOOGLE_REDIRECT_URI"
  | "GOOGLE_ADS_DEVELOPER_TOKEN"
  | "GOOGLE_ADS_LOGIN_CUSTOMER_ID"
  | "META_APP_ID"
  | "META_APP_SECRET"
  | "META_REDIRECT_URI"
  | "SUPABASE_SERVICE_ROLE_KEY";

export function getOptionalEnv(key: ServerEnvKey) {
  return process.env[key] ?? readLocalEnvValue(key);
}

export function getRequiredEnv(key: ServerEnvKey) {
  const value = getOptionalEnv(key);

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export function getAppBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function readLocalEnvValue(key: string) {
  if (typeof window !== "undefined") return undefined;

  try {
    const { existsSync, readFileSync } = require("fs") as typeof import("fs");
    const { join } = require("path") as typeof import("path");
    const envPath = join(process.cwd(), ".env.local");

    if (!existsSync(envPath)) return undefined;

    const line = readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .find((entry) => entry.startsWith(`${key}=`));

    return line?.slice(key.length + 1) || undefined;
  } catch {
    return undefined;
  }
}

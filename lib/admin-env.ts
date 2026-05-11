import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const editableKeys = [
  "DREAMGROWTH_APP_PASSWORD",
  "DREAMGROWTH_SESSION_SECRET",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "AI_PROVIDER",
  "GEMINI_API_KEY",
  "GEMINI_MODEL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_REDIRECT_URI",
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_LOGIN_CUSTOMER_ID",
  "META_APP_ID",
  "META_APP_SECRET",
  "META_REDIRECT_URI"
] as const;

export type EditableEnvKey = (typeof editableKeys)[number];
export type EditableEnvInput = Partial<Record<EditableEnvKey, string>>;

const envPath = join(process.cwd(), ".env.local");

export function getEditableEnvStatus() {
  const values = readEnvFile();

  return editableKeys.reduce(
    (status, key) => {
      const value = values[key] ?? process.env[key] ?? "";
      status[key] = {
        configured: Boolean(value),
        preview: previewSecret(value)
      };
      return status;
    },
    {} as Record<EditableEnvKey, { configured: boolean; preview: string }>
  );
}

export function saveEditableEnv(input: EditableEnvInput) {
  const existing = readEnvFile();
  const next = { ...existing };

  for (const key of editableKeys) {
    const value = input[key];

    if (typeof value === "string" && value.trim() !== "") {
      next[key] = value.trim();
    }
  }

  if (!next.OPENAI_MODEL) {
    next.OPENAI_MODEL = "gpt-4o";
  }

  if (!next.AI_PROVIDER) {
    next.AI_PROVIDER = "gemini";
  }

  if (!next.GEMINI_MODEL) {
    next.GEMINI_MODEL = "gemini-2.5-flash";
  }

  writeFileSync(envPath, serializeEnv(next), "utf8");
  return getEditableEnvStatus();
}

function readEnvFile() {
  if (!existsSync(envPath)) {
    return {} as Record<string, string>;
  }

  return readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .reduce(
      (values, line) => {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) return values;

        const index = trimmed.indexOf("=");

        if (index === -1) return values;

        const key = trimmed.slice(0, index);
        const value = trimmed.slice(index + 1);
        values[key] = value;
        return values;
      },
      {} as Record<string, string>
    );
}

function serializeEnv(values: Record<string, string>) {
  return editableKeys
    .map((key) => `${key}=${values[key] ?? ""}`)
    .join("\n")
    .concat("\n");
}

function previewSecret(value: string) {
  if (!value) return "";
  if (value.length <= 8) return "configured";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

import { randomBytes } from "crypto";

export function createOAuthState(provider: "google" | "meta") {
  return `${provider}_${randomBytes(24).toString("hex")}`;
}

export function parseOAuthState(state: string | null) {
  if (!state) return null;
  const [provider] = state.split("_");

  if (provider !== "google" && provider !== "meta") {
    return null;
  }

  return { provider };
}

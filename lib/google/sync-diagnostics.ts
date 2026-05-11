import type { IntegrationConnection } from "@/lib/integrations/store";

export type GoogleSyncDiagnostic = {
  reason: string;
  stage: string;
  status: number | null;
  message: string;
  hint: string;
  helpUrl: string | null;
  lastSyncAttemptAt: string | null;
};

export function getGoogleSyncDiagnostic(
  connection: Pick<IntegrationConnection, "metadata">
): GoogleSyncDiagnostic | null {
  const raw = connection.metadata.lastSyncError;

  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as {
    reason?: string;
    stage?: string;
    status?: number | null;
    message?: string;
    hint?: string;
    helpUrl?: string | null;
  };

  if (!candidate.reason || !candidate.message || !candidate.hint) {
    return null;
  }

  return {
    reason: candidate.reason,
    stage: candidate.stage ?? "unknown",
    status:
      typeof candidate.status === "number" || candidate.status === null
        ? candidate.status
        : null,
    message: candidate.message,
    hint: candidate.hint,
    helpUrl: typeof candidate.helpUrl === "string" ? candidate.helpUrl : null,
    lastSyncAttemptAt:
      typeof connection.metadata.lastSyncAttemptAt === "string"
        ? connection.metadata.lastSyncAttemptAt
        : null
  };
}

export function getGoogleSyncDiagnosticTitle(
  diagnostic: GoogleSyncDiagnostic | null
) {
  if (!diagnostic) {
    return null;
  }

  switch (diagnostic.reason) {
    case "api_not_enabled":
      return "Enable the Google Business APIs";
    case "api_forbidden":
      return "Google Business access is still blocked";
    case "refresh_token_missing":
      return "Reconnect Google to restore the offline token";
    case "token_expired":
      return "Reconnect Google to refresh the session";
    case "no_accounts":
      return "No Google Business accounts were returned";
    case "no_locations":
      return "No readable Business Profile locations were returned";
    case "rate_limited":
      return "Google sync is temporarily rate limited";
    default:
      return "Google sync still needs attention";
  }
}

export function formatGoogleSyncAttempt(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return null;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

import { NextResponse } from "next/server";
import { buildAppUrl } from "@/lib/http/app-url";
import { syncGoogleIntegrationSummary } from "@/lib/google/service";

export async function POST(request: Request) {
  try {
    await syncGoogleIntegrationSummary();
    return NextResponse.redirect(
      buildAppUrl(request, "/google-business?sync=success")
    );
  } catch (error) {
    const reason = classifyGoogleSyncError(error);
    return NextResponse.redirect(
      buildAppUrl(request, `/google-business?sync=failed&reason=${reason}`)
    );
  }
}

function classifyGoogleSyncError(error: unknown) {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes("refresh token is missing")) {
    return "refresh_token_missing";
  }

  if (message.includes("401")) {
    return "token_expired";
  }

  if (message.includes("403")) {
    return "api_forbidden";
  }

  if (message.includes("404")) {
    return "api_not_enabled";
  }

  if (message.includes("429")) {
    return "rate_limited";
  }

  return "unknown";
}

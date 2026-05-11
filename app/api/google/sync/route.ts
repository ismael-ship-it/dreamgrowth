import { NextResponse } from "next/server";
import { syncGoogleIntegrationSummary } from "@/lib/google/service";

export async function POST(request: Request) {
  try {
    await syncGoogleIntegrationSummary();
    return NextResponse.redirect(
      new URL("/google-business?sync=success", request.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/google-business?sync=failed", request.url)
    );
  }
}

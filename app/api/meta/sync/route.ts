import { NextResponse } from "next/server";
import { buildAppUrl } from "@/lib/http/app-url";
import { syncMetaIntegrationSummary } from "@/lib/meta/service";

export async function POST(request: Request) {
  try {
    await syncMetaIntegrationSummary();
    return NextResponse.redirect(buildAppUrl(request, "/meta?sync=success"));
  } catch {
    return NextResponse.redirect(buildAppUrl(request, "/meta?sync=failed"));
  }
}

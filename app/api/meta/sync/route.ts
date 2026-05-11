import { NextResponse } from "next/server";
import { syncMetaIntegrationSummary } from "@/lib/meta/service";

export async function POST(request: Request) {
  try {
    await syncMetaIntegrationSummary();
    return NextResponse.redirect(new URL("/meta?sync=success", request.url));
  } catch {
    return NextResponse.redirect(new URL("/meta?sync=failed", request.url));
  }
}

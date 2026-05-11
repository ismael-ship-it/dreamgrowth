import { NextResponse } from "next/server";
import { getGoogleIntegrationSummary } from "@/lib/google/service";

export async function GET() {
  return NextResponse.json(await getGoogleIntegrationSummary());
}

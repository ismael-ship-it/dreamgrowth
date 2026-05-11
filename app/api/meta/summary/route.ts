import { NextResponse } from "next/server";
import { getMetaIntegrationSummary } from "@/lib/meta/service";

export async function GET() {
  return NextResponse.json(await getMetaIntegrationSummary());
}

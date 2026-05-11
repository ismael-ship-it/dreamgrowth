import { NextResponse } from "next/server";
import {
  getGoogleConnection,
  getGoogleIntegrationSummary
} from "@/lib/google/service";
import { getMetaConnection, getMetaIntegrationSummary } from "@/lib/meta/service";
import { buildOperatorDailyStack } from "@/lib/task-engine";

export async function GET() {
  const [google, meta, googleConnection, metaConnection] = await Promise.all([
    getGoogleIntegrationSummary(),
    getMetaIntegrationSummary(),
    Promise.resolve(getGoogleConnection()),
    Promise.resolve(getMetaConnection())
  ]);
  const result = buildOperatorDailyStack({
    google,
    meta,
    googleConnection,
    metaConnection
  });

  return NextResponse.json({
    ...result,
    generatedAt: new Date().toISOString()
  });
}

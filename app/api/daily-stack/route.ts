import { NextResponse } from "next/server";
import { generateDailyStackWithOpenAI } from "@/lib/ai/openai";
import {
  getGoogleConnection,
  getGoogleIntegrationSummary
} from "@/lib/google/service";
import { getMetaConnection, getMetaIntegrationSummary } from "@/lib/meta/service";

export async function GET() {
  const [google, meta, googleConnection, metaConnection] = await Promise.all([
    getGoogleIntegrationSummary(),
    getMetaIntegrationSummary(),
    Promise.resolve(getGoogleConnection()),
    Promise.resolve(getMetaConnection())
  ]);
  const result = await generateDailyStackWithOpenAI({
    google,
    meta,
    connection: {
      googleConnected: googleConnection.isConnected,
      metaConnected: metaConnection.isConnected,
      googleLiveSync: Boolean(googleConnection.metadata.liveSync),
      metaLiveSync: Boolean(metaConnection.metadata.liveSync)
    },
    approvalRule: "AI recommends. Owner approves. DreamGrowth executes."
  });

  return NextResponse.json({
    tasks: result.tasks,
    generatedAt: new Date().toISOString(),
    approvalRule: "AI recommends. Owner approves. DreamGrowth executes.",
    note: result.note
  });
}

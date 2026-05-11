import { NextResponse } from "next/server";
import { googleIntegrationSummary } from "@/lib/google/mock-data";
import { metaIntegrationSummary } from "@/lib/meta/mock-data";
import { generateDailyStackWithOpenAI } from "@/lib/ai/openai";

export async function POST() {
  const result = await generateDailyStackWithOpenAI({
    google: googleIntegrationSummary,
    meta: metaIntegrationSummary,
    approvalRule: "AI recommends. Owner approves. DreamGrowth executes."
  });

  return NextResponse.json(result);
}

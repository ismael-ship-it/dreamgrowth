import { NextResponse } from "next/server";
import {
  generateDailyGrowthStack,
  mockGrowthSignals
} from "@/lib/task-engine";

export async function GET() {
  return NextResponse.json({
    tasks: generateDailyGrowthStack(mockGrowthSignals),
    generatedAt: new Date().toISOString(),
    approvalRule: "AI recommends. Owner approves. DreamGrowth executes."
  });
}

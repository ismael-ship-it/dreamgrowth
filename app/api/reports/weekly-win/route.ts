import { NextResponse } from "next/server";
import { getWeeklyWinReport } from "@/lib/reports/weekly-win";

export async function GET() {
  return NextResponse.json(getWeeklyWinReport());
}

import { NextResponse } from "next/server";
import { fetchGoogleAdsSentinelSnapshot } from "@/lib/google/service";

export async function GET() {
  return NextResponse.json(await fetchGoogleAdsSentinelSnapshot());
}

import { NextResponse } from "next/server";
import { fetchMetaCampaignsSnapshot } from "@/lib/meta/service";

export async function GET() {
  return NextResponse.json(await fetchMetaCampaignsSnapshot());
}

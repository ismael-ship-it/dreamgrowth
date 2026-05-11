import { NextResponse } from "next/server";
import { fetchMetaPublishingSnapshot } from "@/lib/meta/service";

export async function GET() {
  return NextResponse.json(await fetchMetaPublishingSnapshot());
}

import { NextResponse } from "next/server";
import { fetchMetaLeadsSnapshot } from "@/lib/meta/service";

export async function GET() {
  return NextResponse.json(await fetchMetaLeadsSnapshot());
}

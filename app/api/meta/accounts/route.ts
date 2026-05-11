import { NextResponse } from "next/server";
import { fetchMetaAccountsSnapshot } from "@/lib/meta/service";

export async function GET() {
  return NextResponse.json(await fetchMetaAccountsSnapshot());
}

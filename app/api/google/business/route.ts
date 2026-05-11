import { NextResponse } from "next/server";
import { fetchGoogleBusinessSnapshot } from "@/lib/google/service";

export async function GET() {
  return NextResponse.json(await fetchGoogleBusinessSnapshot());
}

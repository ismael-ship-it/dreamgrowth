import { NextResponse } from "next/server";
import { fetchSearchConsoleSnapshot } from "@/lib/google/service";

export async function GET() {
  return NextResponse.json(await fetchSearchConsoleSnapshot());
}

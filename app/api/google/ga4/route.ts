import { NextResponse } from "next/server";
import { fetchGa4Snapshot } from "@/lib/google/service";

export async function GET() {
  return NextResponse.json(await fetchGa4Snapshot());
}

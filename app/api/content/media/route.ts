import { NextResponse } from "next/server";
import { getProjectMediaLibrary } from "@/lib/content/generator";

export async function GET() {
  return NextResponse.json({ media: await getProjectMediaLibrary() });
}

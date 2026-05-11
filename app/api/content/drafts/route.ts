import { NextResponse } from "next/server";
import { generateDraftsForFirstProject } from "@/lib/content/generator";

export async function GET() {
  return NextResponse.json(await generateDraftsForFirstProject());
}

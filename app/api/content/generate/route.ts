import { NextResponse } from "next/server";
import { generateContentDrafts } from "@/lib/content/generator";
import type {
  ContentPlatform,
  ProjectMediaInput
} from "@/lib/content/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    media?: ProjectMediaInput;
    platforms?: ContentPlatform[];
  };

  if (!body.media || !body.platforms?.length) {
    return NextResponse.json(
      { error: "media and platforms are required" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    await generateContentDrafts({
      media: body.media,
      platforms: body.platforms
    })
  );
}

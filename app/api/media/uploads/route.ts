import { NextResponse } from "next/server";
import {
  createMediaUploadRecords,
  listUploadedMedia
} from "@/lib/media/service";
import type { MediaUploadPayload } from "@/lib/media/types";

export async function GET() {
  return NextResponse.json({ uploads: listUploadedMedia() });
}

export async function POST(request: Request) {
  const payload = (await request.json()) as MediaUploadPayload;

  if (!payload.files?.length) {
    return NextResponse.json({ error: "At least one file is required" }, { status: 400 });
  }

  if (!payload.city || !payload.materialType || !payload.serviceType) {
    return NextResponse.json(
      { error: "city, materialType, and serviceType are required" },
      { status: 400 }
    );
  }

  return NextResponse.json({
    uploads: createMediaUploadRecords(payload),
    note:
      "Mock upload registered. Replace this endpoint with Supabase Storage upload when Supabase credentials are configured."
  });
}

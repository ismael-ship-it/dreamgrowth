import { NextResponse } from "next/server";
import { createGoogleApprovalRequest } from "@/lib/google/service";
import type { GoogleApprovalAction } from "@/lib/google/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: GoogleApprovalAction;
    relatedRecordId?: string;
  };

  if (!body.action || !body.relatedRecordId) {
    return NextResponse.json(
      { error: "action and relatedRecordId are required" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    await createGoogleApprovalRequest({
      action: body.action,
      relatedRecordId: body.relatedRecordId
    })
  );
}

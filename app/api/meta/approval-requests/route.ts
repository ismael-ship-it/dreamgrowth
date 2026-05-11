import { NextResponse } from "next/server";
import { createMetaApprovalRequest } from "@/lib/meta/service";
import type { MetaApprovalAction } from "@/lib/meta/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action?: MetaApprovalAction;
    relatedRecordId?: string;
  };

  if (!body.action || !body.relatedRecordId) {
    return NextResponse.json(
      { error: "action and relatedRecordId are required" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    await createMetaApprovalRequest({
      action: body.action,
      relatedRecordId: body.relatedRecordId
    })
  );
}

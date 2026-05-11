import { NextResponse } from "next/server";
import {
  getEditableEnvStatus,
  saveEditableEnv,
  type EditableEnvInput
} from "@/lib/admin-env";

export async function GET() {
  return NextResponse.json({ status: getEditableEnvStatus() });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error:
          "In production, save secrets through your hosting provider or a secure secrets manager."
      },
      { status: 403 }
    );
  }

  const input = (await request.json()) as EditableEnvInput;

  return NextResponse.json({
    status: saveEditableEnv(input),
    message:
      "Credentials saved to .env.local. Restart the dev server if a connection still shows setup needed."
  });
}

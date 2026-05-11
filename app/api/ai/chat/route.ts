import { NextResponse } from "next/server";
import { askGrowthChat, type ChatMessage } from "@/lib/ai/chat";

export async function POST(request: Request) {
  const body = (await request.json()) as { messages?: ChatMessage[] };

  if (!body.messages?.length) {
    return NextResponse.json(
      { error: "messages are required" },
      { status: 400 }
    );
  }

  return NextResponse.json(await askGrowthChat(body.messages));
}

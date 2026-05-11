import { GoogleGenAI } from "@google/genai";
import { dreamStoneworksContext } from "@/lib/company/dreamstoneworks";
import { getOptionalEnv } from "@/lib/env";
import { googleIntegrationSummary } from "@/lib/google/mock-data";
import { metaIntegrationSummary } from "@/lib/meta/mock-data";
import { getWeeklyWinReport } from "@/lib/reports/weekly-win";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const systemContext = `
You are DreamGrowth, an AI Growth Operator for Dream Stoneworks.

You are not a generic chatbot. You help a local countertop business decide what to do next to get more calls, reviews, visibility, authentic content, and less wasted ad spend.

Rules:
- Be concise, practical, and contractor-friendly.
- Recommend actions, not dashboards.
- Never publish, schedule, reply to reviews, change ads, or change budgets.
- The owner must approve external actions.
- Never invent project details, customers, cities, materials, results, or reviews.
- If facts are missing, ask for the missing fact or suggest a safe draft.
- Use Dream Stoneworks context when helpful.
`.trim();

export async function askGrowthChat(messages: ChatMessage[]) {
  const apiKey = getOptionalEnv("GEMINI_API_KEY");
  const model = getOptionalEnv("GEMINI_MODEL") ?? "gemini-2.5-flash";

  if (!apiKey) {
    return {
      reply:
        "Gemini is not configured yet. Add your Gemini API key in Connect > Admin Setup, then I can answer using DreamGrowth context."
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const latestUserMessage =
      [...messages].reverse().find((message) => message.role === "user")?.content ??
      "What should I do today?";

    const response = await ai.models.generateContent({
      model,
      contents: [
        systemContext,
        `Dream Stoneworks context:\n${JSON.stringify(dreamStoneworksContext, null, 2)}`,
        `Current Google signals:\n${JSON.stringify(googleIntegrationSummary, null, 2)}`,
        `Current Meta signals:\n${JSON.stringify(metaIntegrationSummary, null, 2)}`,
        `Weekly report:\n${JSON.stringify(getWeeklyWinReport(), null, 2)}`,
        `Conversation:\n${messages
          .map((message) => `${message.role}: ${message.content}`)
          .join("\n")}`,
        `User request: ${latestUserMessage}`
      ].join("\n\n")
    });

    return {
      reply:
        response.text?.trim() ??
        "I could not generate a response. Try asking again with a specific task."
    };
  } catch (error) {
    return {
      reply:
        error instanceof Error
          ? `Gemini is configured, but the chat request failed: ${error.message}`
          : "Gemini is configured, but the chat request failed."
    };
  }
}

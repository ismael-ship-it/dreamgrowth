import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { getCompanyProfile } from "@/lib/company/profile";
import { getOptionalEnv } from "@/lib/env";
import { getGoogleIntegrationSummary } from "@/lib/google/service";
import { getMetaIntegrationSummary } from "@/lib/meta/service";
import { getWeeklyWinReport } from "@/lib/reports/weekly-win";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const baseSystemContext = `
You are DreamGrowth, an AI Growth Operator for a local business.

You are not a generic chatbot. You help the business owner decide what to do next to get more calls, reviews, visibility, authentic content, and less wasted ad spend.

Rules:
- Be concise, practical, and contractor-friendly.
- Recommend actions, not dashboards.
- Never publish, schedule, reply to reviews, change ads, or change budgets.
- The owner must approve external actions.
- Never invent project details, customers, cities, materials, results, or reviews.
- If facts are missing, ask for the missing fact or suggest a safe draft.
- Use the saved company profile when helpful.
`.trim();

export async function askGrowthChat(messages: ChatMessage[]) {
  const provider = getOptionalEnv("AI_PROVIDER") ?? "gemini";
  const companyProfile = getCompanyProfile();
  const [googleSummary, metaSummary] = await Promise.all([
    getGoogleIntegrationSummary(),
    getMetaIntegrationSummary()
  ]);
  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ??
    "What should I do today?";
  const prompt = [
    `${baseSystemContext}\nBusiness name: ${companyProfile.companyName}`,
    `Company profile:\n${JSON.stringify(companyProfile, null, 2)}`,
    `Current Google signals:\n${JSON.stringify(googleSummary, null, 2)}`,
    `Current Meta signals:\n${JSON.stringify(metaSummary, null, 2)}`,
    `Weekly report:\n${JSON.stringify(getWeeklyWinReport(), null, 2)}`,
    `Conversation:\n${messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n")}`,
    `User request: ${latestUserMessage}`
  ].join("\n\n");

  if (provider === "openai") {
    const apiKey = getOptionalEnv("OPENAI_API_KEY");
    const model = getOptionalEnv("OPENAI_MODEL") ?? "gpt-4o";

    if (!apiKey) {
      return {
        reply:
          "OpenAI is selected but not configured yet. Add your OpenAI API key in Connect > Admin Setup, then I can answer using DreamGrowth context."
      };
    }

    try {
      const client = new OpenAI({ apiKey });
      const response = await client.responses.create({
        model,
        input: prompt
      });

      return {
        reply:
          response.output_text?.trim() ??
          "I could not generate a response. Try asking again with a specific task."
      };
    } catch (error) {
      return {
        reply:
          error instanceof Error
            ? `OpenAI is configured, but the chat request failed: ${error.message}`
            : "OpenAI is configured, but the chat request failed."
      };
    }
  }

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

    const response = await ai.models.generateContent({
      model,
      contents: prompt
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

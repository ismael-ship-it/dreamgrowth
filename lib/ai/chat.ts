import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { getAppReadiness } from "@/lib/app-readiness";
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
- Distinguish clearly between app credentials being configured and an account actually being connected.
`.trim();

export async function askGrowthChat(messages: ChatMessage[]) {
  const provider = getOptionalEnv("AI_PROVIDER") ?? "gemini";
  const companyProfile = getCompanyProfile();
  const readiness = getAppReadiness();
  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ??
    "What should I do today?";
  const directConnectionReply = getDirectConnectionReply(
    latestUserMessage,
    readiness
  );

  if (directConnectionReply) {
    return {
      reply: directConnectionReply
    };
  }

  const [googleSummary, metaSummary, weeklyReport] = await Promise.all([
    getGoogleIntegrationSummary(),
    getMetaIntegrationSummary(),
    getWeeklyWinReport()
  ]);
  const prompt = [
    `${baseSystemContext}\nBusiness name: ${companyProfile.companyName}`,
    `Company profile:\n${JSON.stringify(companyProfile, null, 2)}`,
    `Connection readiness:\n${JSON.stringify(
      {
        google: {
          credentialsConfigured: readiness.googleCredentialsReady,
          accountConnected: readiness.google.isConnected,
          liveSyncReady: Boolean(readiness.google.metadata.liveSync),
          connectedAs: readiness.google.displayName
        },
        meta: {
          credentialsConfigured: readiness.metaCredentialsReady,
          accountConnected: readiness.meta.isConnected,
          liveSyncReady: Boolean(readiness.meta.metadata.liveSync),
          connectedAs: readiness.meta.displayName
        },
        ai: {
          provider: readiness.aiProvider,
          ready: readiness.aiReady
        }
      },
      null,
      2
    )}`,
    `Current Google signals:\n${JSON.stringify(googleSummary, null, 2)}`,
    `Current Meta signals:\n${JSON.stringify(metaSummary, null, 2)}`,
    `Weekly report:\n${JSON.stringify(weeklyReport, null, 2)}`,
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

function getDirectConnectionReply(
  message: string,
  readiness: ReturnType<typeof getAppReadiness>
) {
  const normalized = message.toLowerCase();

  if (
    normalized.includes("google") &&
    (normalized.includes("conect") ||
      normalized.includes("connect") ||
      normalized.includes("linked") ||
      normalized.includes("lista") ||
      normalized.includes("ready"))
  ) {
    if (readiness.google.isConnected) {
      return `Sí. Google ya está conectada${
        readiness.google.displayName ? ` como ${readiness.google.displayName}` : ""
      }. ${
        readiness.google.metadata.liveSync
          ? "Además, Google Business ya tiene base de sync live guardada en DreamGrowth."
          : "Lo siguiente recomendable es abrir Google Business y correr el primer sync live."
      }`;
    }

    if (readiness.googleCredentialsReady) {
      return "Todavía no hay una cuenta Google conectada. Lo que sí está listo son las credenciales técnicas de la app. El siguiente paso real es abrir Settings o Connect y pulsar `Connect Google` para enlazar la cuenta del negocio.";
    }

    return "Todavía no. Primero falta la configuración técnica inicial de Google en el setup avanzado y luego sí se conecta la cuenta del negocio con `Connect Google`.";
  }

  if (
    normalized.includes("meta") &&
    (normalized.includes("conect") ||
      normalized.includes("connect") ||
      normalized.includes("linked") ||
      normalized.includes("lista") ||
      normalized.includes("ready"))
  ) {
    if (readiness.meta.isConnected) {
      return `Sí. Meta ya está conectada${
        readiness.meta.displayName ? ` como ${readiness.meta.displayName}` : ""
      }. ${
        readiness.meta.metadata.liveSync
          ? "La estructura base de Meta ya fue sincronizada en DreamGrowth."
          : "Lo siguiente recomendable es abrir Meta y correr el primer sync."
      }`;
    }

    if (readiness.metaCredentialsReady) {
      return "Todavía no hay una cuenta Meta conectada. Las credenciales de la app sí pueden estar guardadas, pero aún falta pulsar `Connect Meta` para enlazar la cuenta real.";
    }

    return "Todavía no. Primero falta la configuración técnica inicial de Meta y después se conecta la cuenta real con `Connect Meta`.";
  }

  return null;
}

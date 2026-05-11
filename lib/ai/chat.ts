import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { getAppReadiness } from "@/lib/app-readiness";
import { getCompanyProfile } from "@/lib/company/profile";
import { getOptionalEnv } from "@/lib/env";
import {
  getGoogleSyncDiagnostic,
  getGoogleSyncDiagnosticTitle
} from "@/lib/google/sync-diagnostics";
import { getGoogleIntegrationSummary } from "@/lib/google/service";
import { getMeaningfulConnectionName } from "@/lib/integrations/display-name";
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
- This product is the Google Business Operator. Lead with Google Business actions unless the user explicitly asks about another channel.
- Recommend actions, not dashboards.
- Never publish, schedule, reply to reviews, change ads, or change budgets.
- The owner must approve external actions.
- Never invent project details, customers, cities, materials, results, or reviews.
- If facts are missing, ask for the missing fact or suggest a safe draft.
- Use the saved company profile when helpful.
- Distinguish clearly between app credentials being configured and an account actually being connected.
- Only describe data as live or synced when the workspace context explicitly says it is live.
- Never claim Google Ads, GA4, Search Console, or Meta lead performance unless the workspace context includes real synced data for that source.
`.trim();

type ChatWorkspaceContext = {
  companyProfile: ReturnType<typeof getCompanyProfile>;
  readiness: ReturnType<typeof getAppReadiness>;
  googleSummary: Awaited<ReturnType<typeof getGoogleIntegrationSummary>>;
  metaSummary: Awaited<ReturnType<typeof getMetaIntegrationSummary>>;
  weeklyReport: Awaited<ReturnType<typeof getWeeklyWinReport>>;
};

type ProviderFallbackInfo = {
  providerName: "OpenAI" | "Gemini";
  reason: "missing_config" | "empty_response" | "request_failed";
  status?: number | null;
};

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
  const preferredLanguage = detectPreferredLanguage(messages);

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
  const workspaceContext: ChatWorkspaceContext = {
    companyProfile,
    readiness,
    googleSummary,
    metaSummary,
    weeklyReport
  };
  const prompt = buildModelPrompt(messages, latestUserMessage, workspaceContext);

  if (provider === "openai") {
    const apiKey = getOptionalEnv("OPENAI_API_KEY");
    const model = getOptionalEnv("OPENAI_MODEL") ?? "gpt-4o";

    if (!apiKey) {
      return {
        reply: buildFallbackReply(latestUserMessage, workspaceContext, {
          providerName: "OpenAI",
          reason: "missing_config"
        }, preferredLanguage)
      };
    }

    try {
      const client = new OpenAI({ apiKey });
      const response = await client.responses.create({
        model,
        input: prompt
      });
      const reply = response.output_text?.trim();

      return {
        reply:
          reply ??
          buildFallbackReply(latestUserMessage, workspaceContext, {
            providerName: "OpenAI",
            reason: "empty_response"
          }, preferredLanguage)
      };
    } catch (error) {
      return {
        reply: buildFallbackReply(latestUserMessage, workspaceContext, {
          providerName: "OpenAI",
          reason: "request_failed",
          status: getProviderStatus(error)
        }, preferredLanguage)
      };
    }
  }

  const apiKey = getOptionalEnv("GEMINI_API_KEY");
  const model = getOptionalEnv("GEMINI_MODEL") ?? "gemini-2.5-flash";

  if (!apiKey) {
    return {
      reply: buildFallbackReply(latestUserMessage, workspaceContext, {
        providerName: "Gemini",
        reason: "missing_config"
      }, preferredLanguage)
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    });
    const reply = response.text?.trim();

    return {
      reply:
        reply ??
          buildFallbackReply(latestUserMessage, workspaceContext, {
            providerName: "Gemini",
            reason: "empty_response"
          }, preferredLanguage)
    };
  } catch (error) {
    return {
      reply: buildFallbackReply(latestUserMessage, workspaceContext, {
        providerName: "Gemini",
        reason: "request_failed",
        status: getProviderStatus(error)
      }, preferredLanguage)
    };
  }
}

function getDirectConnectionReply(
  message: string,
  readiness: ReturnType<typeof getAppReadiness>
) {
  const normalized = message.toLowerCase();
  const googleSyncDiagnostic = getGoogleSyncDiagnostic(readiness.google);

  if (
    normalized.includes("google") &&
    (normalized.includes("conect") ||
      normalized.includes("connect") ||
      normalized.includes("linked") ||
      normalized.includes("lista") ||
      normalized.includes("ready"))
  ) {
    if (readiness.google.isConnected) {
      const connectedAs = getMeaningfulConnectionName(readiness.google.displayName);

      if (googleSyncDiagnostic) {
        return `Si. Google ya esta conectada${
          connectedAs ? ` como ${connectedAs}` : ""
        }, pero el primer sync esta bloqueado por Google. ${
          getGoogleSyncDiagnosticTitle(googleSyncDiagnostic) ??
          "Google sync needs attention"
        }: ${googleSyncDiagnostic.hint}`;
      }

      return `Si. Google ya esta conectada${
        connectedAs ? ` como ${connectedAs}` : ""
      }. ${
        readiness.google.metadata.liveSync
          ? "El live sync de Google Business ya esta activo. Siguiente paso practico: revisa las ubicaciones y resenas sincronizadas y prepara la siguiente respuesta o post para aprobacion."
          : "Todavia falta el primer live sync. Siguiente paso real: abre Google Business y corre el primer sync para traer cuentas, ubicaciones y resenas a DreamGrowth."
      }`;
    }

    if (readiness.googleCredentialsReady) {
      return "Todavia no hay una cuenta Google conectada. Las credenciales tecnicas de la app si estan listas. Siguiente paso: abre Settings o Connect, pulsa `Connect Google` y autoriza la cuenta real del negocio.";
    }

    return "Todavia no. Primero falta la configuracion tecnica inicial de Google en el setup avanzado y despues se conecta la cuenta real del negocio con `Connect Google`.";
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
      const connectedAs = getMeaningfulConnectionName(readiness.meta.displayName);
      return `Si. Meta ya esta conectada${
        connectedAs ? ` como ${connectedAs}` : ""
      }. ${
        readiness.meta.metadata.liveSync
          ? "La estructura base ya fue sincronizada en DreamGrowth. Siguiente paso practico: revisar Pages, Instagram y cuentas publicitarias conectadas antes de usar cualquier flujo nuevo."
          : "Todavia falta el primer sync. Siguiente paso real: abre Meta y corre el primer sync para confirmar Pages, Instagram y cuentas publicitarias."
      }`;
    }

    if (readiness.metaCredentialsReady) {
      return "Todavia no hay una cuenta Meta conectada. Las credenciales de la app pueden estar guardadas, pero aun falta pulsar `Connect Meta` para enlazar la cuenta real.";
    }

    return "Todavia no. Primero falta la configuracion tecnica inicial de Meta y despues se conecta la cuenta real con `Connect Meta`.";
  }

  return null;
}

function buildModelPrompt(
  messages: ChatMessage[],
  latestUserMessage: string,
  context: ChatWorkspaceContext
) {
  return [
    baseSystemContext,
    `Trusted workspace context:\n${JSON.stringify(
      buildTrustedWorkspaceContext(context),
      null,
      2
    )}`,
    `Conversation:\n${messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n")}`,
    `User request: ${latestUserMessage}`,
    "Answer with the single best next move first. If a channel is not synced, say that plainly and give the owner the next safe action."
  ].join("\n\n");
}

function buildTrustedWorkspaceContext(context: ChatWorkspaceContext) {
  const googleLiveSync = Boolean(context.readiness.google.metadata.liveSync);
  const metaLiveSync = Boolean(context.readiness.meta.metadata.liveSync);

  return {
    companyProfile: {
      companyName: context.companyProfile.companyName,
      primaryCity: context.companyProfile.primaryCity,
      primaryState: context.companyProfile.primaryState,
      industry: context.companyProfile.industry,
      tone: context.companyProfile.tone,
      services: context.companyProfile.services.slice(0, 6),
      serviceAreas: context.companyProfile.serviceAreas.slice(0, 6),
      callsToAction: context.companyProfile.callsToAction.slice(0, 3),
      rules: context.companyProfile.rules
    },
    readiness: {
      google: {
        credentialsConfigured: context.readiness.googleCredentialsReady,
        accountConnected: context.readiness.google.isConnected,
        liveSyncReady: googleLiveSync,
        connectedAs: getMeaningfulConnectionName(
          context.readiness.google.displayName
        ),
        lastSyncAt: context.readiness.google.lastSyncAt,
        syncDiagnostic: getGoogleSyncDiagnostic(context.readiness.google)
      },
      meta: {
        credentialsConfigured: context.readiness.metaCredentialsReady,
        accountConnected: context.readiness.meta.isConnected,
        liveSyncReady: metaLiveSync,
        connectedAs: getMeaningfulConnectionName(
          context.readiness.meta.displayName
        ),
        lastSyncAt: context.readiness.meta.lastSyncAt
      },
      ai: {
        provider: context.readiness.aiProvider,
        ready: context.readiness.aiReady
      }
    },
    googleBusiness: googleLiveSync
      ? {
          dataMode: "live",
          locationsSynced: readNumericMetric(
            context.googleSummary.googleBusiness.metrics,
            "Locations"
          ),
          reviewsSynced: context.googleSummary.googleBusiness.reviews.length,
          latestReviews: context.googleSummary.googleBusiness.reviews
            .slice(0, 3)
            .map((review) => ({
              reviewerName: review.reviewerName,
              rating: review.rating,
              comment: review.comment,
              createdAt: review.createdAt
            })),
          postDraftsReady: context.googleSummary.googleBusiness.postDrafts.map(
            (draft) => ({
              title: draft.title,
              sourcePhoto: draft.sourcePhoto,
              status: draft.status
            })
          ),
          approvalRule: context.googleSummary.approvalRule
        }
      : {
          dataMode: context.readiness.google.isConnected
            ? "connected_pending_live_sync"
            : "not_connected",
          note: context.readiness.google.isConnected
            ? "Google is connected, but DreamGrowth does not have a completed live Google Business sync yet."
            : "Google is not connected yet.",
          approvalRule: context.googleSummary.approvalRule
        },
    googleAds: {
      dataMode: "pending_sync",
      note:
        "Do not claim wasted spend, search terms, leads, or budget recommendations as live facts until a dedicated Google Ads sync exists."
    },
    ga4: {
      dataMode: context.googleSummary.ga4.metrics.length ? "live" : "pending_sync",
      metrics: context.googleSummary.ga4.metrics,
      note: context.googleSummary.ga4.metrics.length
        ? "GA4 metrics are present."
        : "Do not claim traffic, calls, or conversion trends from GA4 yet."
    },
    searchConsole: {
      dataMode: context.googleSummary.searchConsole.metrics.length
        ? "live"
        : "pending_sync",
      metrics: context.googleSummary.searchConsole.metrics,
      note: context.googleSummary.searchConsole.metrics.length
        ? "Search Console metrics are present."
        : "Do not claim query or ranking changes from Search Console yet."
    },
    meta: metaLiveSync
      ? {
          dataMode: "live_foundation",
          pagesSynced: context.metaSummary.facebookPages.length,
          instagramAccountsSynced: context.metaSummary.instagramAccounts.length,
          adAccountsSynced: context.metaSummary.adAccounts.length,
          approvalRule: context.metaSummary.approvalRule
        }
      : {
          dataMode: context.readiness.meta.isConnected
            ? "connected_pending_live_sync"
            : "not_connected",
          note: context.readiness.meta.isConnected
            ? "Meta is connected, but the first live sync has not completed yet."
            : "Meta is not connected yet.",
          approvalRule: context.metaSummary.approvalRule
        },
    weeklyReport: getTrustedWeeklyReportContext(context.weeklyReport)
  };
}

function getTrustedWeeklyReportContext(
  weeklyReport: ChatWorkspaceContext["weeklyReport"]
) {
  if (weeklyReport.mode === "partial_live") {
    return {
      mode: weeklyReport.mode,
      note: weeklyReport.note,
      headline: weeklyReport.headline,
      completedTasks: weeklyReport.completedTasks,
      metrics: weeklyReport.metrics,
      trends: weeklyReport.trends
    };
  }

  if (weeklyReport.mode === "setup_needed") {
    return {
      mode: weeklyReport.mode,
      note: weeklyReport.note,
      nextSteps: weeklyReport.completedTasks
    };
  }

  return {
    mode: weeklyReport.mode,
    note:
      "Connected platforms exist, but the weekly report is still in guided mode. Do not present sample totals for money saved, calls, clicks, reviews, or posts as real results until live sync is complete."
  };
}

function buildFallbackReply(
  latestUserMessage: string,
  context: ChatWorkspaceContext,
  info: ProviderFallbackInfo,
  language: "en" | "es"
) {
  return `${getProviderFallbackLead(info, language)}\n\n${getGroundedFallbackAnswer(
    latestUserMessage,
    context,
    language
  )}`;
}

function getProviderFallbackLead(
  info: ProviderFallbackInfo,
  language: "en" | "es"
) {
  if (language === "es") {
    if (info.reason === "missing_config") {
      return `${info.providerName} no esta configurado ahora mismo, asi que te respondo con la lectura real del workspace.`;
    }

    if (info.reason === "empty_response") {
      return `${info.providerName} no devolvio texto util, asi que te respondo con la lectura real del workspace.`;
    }

    if (info.status === 503) {
      return `${info.providerName} esta temporalmente saturado (503), asi que te respondo con la lectura real del workspace.`;
    }

    return `${info.providerName} no esta disponible ahora mismo, asi que te respondo con la lectura real del workspace.`;
  }

  if (info.reason === "missing_config") {
    return `${info.providerName} is not configured right now, so here is the grounded DreamGrowth answer from the current workspace.`;
  }

  if (info.reason === "empty_response") {
    return `${info.providerName} did not return usable text, so here is the grounded DreamGrowth answer from the current workspace.`;
  }

  if (info.status === 503) {
    return `${info.providerName} is temporarily unavailable (503), so here is the grounded DreamGrowth answer from the current workspace.`;
  }

  return `${info.providerName} is unavailable right now, so here is the grounded DreamGrowth answer from the current workspace.`;
}

function getGroundedFallbackAnswer(
  latestUserMessage: string,
  context: ChatWorkspaceContext,
  language: "en" | "es"
) {
  if (language === "es") {
    return getGroundedFallbackAnswerSpanish(latestUserMessage, context);
  }

  const normalized = latestUserMessage.toLowerCase();

  if (
    containsAny(normalized, [
      "review reply",
      "reply draft",
      "respuesta",
      "resena"
    ])
  ) {
    return getReviewReplyFallback(context);
  }

  if (containsAny(normalized, ["review", "reviews"])) {
    return getReviewWorkflowFallback(context);
  }

  if (containsAny(normalized, ["google post", "post idea", "business post"])) {
    return getGooglePostFallback(context);
  }

  if (
    containsAny(normalized, [
      "content idea",
      "content ideas",
      "service area",
      "local content"
    ])
  ) {
    return getLocalContentIdeasFallback(context);
  }

  if (containsAny(normalized, ["weekly", "this week", "wins"])) {
    return getWeeklyWinsFallback(context);
  }

  if (
    containsAny(normalized, [
      "ads",
      "ga4",
      "search console",
      "traffic",
      "clicks",
      "conversions"
    ])
  ) {
    return getAdsAndVisibilityFallback(normalized, context);
  }

  return getTodayFallback(context);
}

function getGroundedFallbackAnswerSpanish(
  latestUserMessage: string,
  context: ChatWorkspaceContext
) {
  const normalized = latestUserMessage.toLowerCase();

  if (
    containsAny(normalized, [
      "google",
      "sincron",
      "sync",
      "resena",
      "review",
      "post",
      "hoy",
      "mejoras",
      "ves"
    ])
  ) {
    if (!context.readiness.google.isConnected) {
      return [
        "Esto es lo real en DreamGrowth ahora mismo:",
        "- Google todavia no esta conectada en este workspace.",
        "- Primero conecta la cuenta duena del negocio.",
        "- Luego corre el primer sync de Google Business para traer cuentas, ubicaciones y resenas reales.",
        "- Hasta que eso exista, no voy a inventar reviews, trafico ni recomendaciones de Ads."
      ].join("\n");
    }

    if (!context.readiness.google.metadata.liveSync) {
      const googleSyncDiagnostic = getGoogleSyncDiagnostic(context.readiness.google);

      return [
        "Esto es lo real en DreamGrowth ahora mismo:",
        "- Ya hay una cuenta Google conectada, pero todavia no existe el primer live sync completo de Google Business.",
        googleSyncDiagnostic
          ? `- El siguiente paso correcto es resolver este bloqueo de Google: ${googleSyncDiagnostic.hint}`
          : "- El siguiente paso correcto es abrir Google Business y correr Sync Google ahora.",
        "- Despues de eso, DreamGrowth podra mostrar ubicaciones, resenas y drafts basados en datos reales.",
        "- Google Ads, GA4 y Search Console siguen pendientes y no deben tratarse como datos confirmados."
      ].join("\n");
    }

    return [
      "Esto es lo real en DreamGrowth ahora mismo:",
      `- Google Business ya tiene live sync activo con ${getGoogleLocationCount(
        context
      )} ubicacion(es) y ${
        context.googleSummary.googleBusiness.reviews.length
      } resena(s) sincronizadas.`,
      "- El mejor siguiente paso es revisar la cola de Reviews o el primer draft de Google Business Post.",
      "- Mantengo Ads, GA4 y Search Console en modo pendiente hasta que tengan su propio live sync."
    ].join("\n");
  }

  if (containsAny(normalized, ["ads", "ga4", "search console", "trafico"])) {
    return [
      "Todavia no puedo confirmar rendimiento real de Ads, GA4 o Search Console desde DreamGrowth.",
      "- Esas capas siguen pendientes de live sync dedicado.",
      "- Lo seguro hoy es usar DreamGrowth para Google Business primero.",
      `- Estado actual de Google: ${getGoogleWorkspaceStatusSpanish(context)}`
    ].join("\n");
  }

  return context.readiness.google.metadata.liveSync
    ? [
        "Hoy yo haria esto:",
        "- Revisar una resena real y preparar una respuesta corta para aprobacion.",
        "- Revisar un draft de Google Business post con una foto real del proyecto.",
        "- No sacar conclusiones de Ads o trafico hasta que esas integraciones tengan live sync propio."
      ].join("\n")
    : [
        "Hoy yo haria esto:",
        "- Confirmar que la cuenta Google conectada es la correcta.",
        "- Correr el primer Sync Google desde Google Business.",
        "- Volver a Daily Stack solo despues de que entren ubicaciones y resenas reales."
      ].join("\n");
}

function getTodayFallback(context: ChatWorkspaceContext) {
  if (!context.readiness.google.isConnected) {
    return [
      "Here is the next operator move based on the current workspace:",
      "- Connect Google first. There is no live Google Business data in DreamGrowth yet.",
      "- Run the first Google sync so the workspace can pull real accounts, locations, and reviews.",
      "- After that, use Growth Chat for review replies and Google post drafts grounded in synced business data.",
      "- Keep Ads, GA4, and Search Console in pending mode until their own live syncs exist."
    ].join("\n");
  }

  if (!context.readiness.google.metadata.liveSync) {
    const googleSyncDiagnostic = getGoogleSyncDiagnostic(context.readiness.google);

    return [
      "Here is the next operator move based on the current workspace:",
      "- A Google account is connected, but there is no completed live Google Business sync yet.",
      googleSyncDiagnostic
        ? `- Fix this Google-side blocker first: ${googleSyncDiagnostic.hint}`
        : "- Run the first Google sync to confirm the correct account, locations, and review footprint.",
      "- Once that data lands, start with one review reply and one Google post draft based on the synced workspace.",
      "- Do not treat Ads, GA4, or Search Console performance as fact yet because those live sync layers are still pending."
    ].join("\n");
  }

  const locations = getGoogleLocationCount(context);
  const reviews = context.googleSummary.googleBusiness.reviews.length;
  const firstDraft = context.googleSummary.googleBusiness.postDrafts[0];
  const nextPostAction = firstDraft
    ? `Use the ready Google post draft for ${firstDraft.sourcePhoto} and swap in the real job photo plus the actual town/material before approval.`
    : `Publish one local proof post about ${context.companyProfile.services[0] ?? "your main service"} in ${context.companyProfile.primaryCity} using a real completed-job photo.`;

  return [
    "Here is the next operator move based on the current workspace:",
    `- Google Business live sync is active with ${locations} location(s) and ${reviews} synced review(s) in DreamGrowth.`,
    reviews
      ? "- Start with the newest positive Google review and draft a reply that uses only verified job details."
      : "- Verify the synced locations first, then ask the last few happy customers for fresh Google reviews.",
    `- ${nextPostAction}`,
    "- Keep Ads, GA4, and Search Console in pending mode until those channels have their own live sync."
  ].join("\n");
}

function getGooglePostFallback(context: ChatWorkspaceContext) {
  const primaryService = context.companyProfile.services[0] ?? "your main service";
  const compareService = context.companyProfile.services[1] ?? primaryService;
  const callToAction =
    context.companyProfile.callsToAction[0] ?? "Request Free Estimate";

  return [
    "Here is a safe Google Business post draft:",
    `Title: ${context.companyProfile.companyName} project update in ${context.companyProfile.primaryCity}`,
    `Body: We recently helped a homeowner in ${context.companyProfile.primaryCity} with ${primaryService}. If you are comparing ${primaryService} and ${compareService}, we can help you choose a surface that fits your layout, style, and budget. ${callToAction}.`,
    `CTA: ${callToAction}`,
    "Trust check: use a real project photo and replace any town, material, or project detail with only what actually happened."
  ].join("\n");
}

function getLocalContentIdeasFallback(context: ChatWorkspaceContext) {
  const services = context.companyProfile.services;
  const areas = context.companyProfile.serviceAreas;

  return [
    "Here are 5 grounded local content ideas:",
    `1. Before-and-after story for a ${services[0] ?? "recent project"} in ${areas[0] ?? context.companyProfile.primaryCity}.`,
    `2. Short explainer: when homeowners in ${areas[1] ?? context.companyProfile.primaryCity} should choose ${services[1] ?? services[0] ?? "your main service"} over ${services[2] ?? services[0] ?? "another option"}.`,
    `3. Photo post from the showroom: how to compare ${services[0] ?? "materials"} without wasting a Saturday.`,
    `4. Local proof post: one common mistake homeowners in ${areas[2] ?? context.companyProfile.primaryCity} make before measuring for ${services[3] ?? services[0] ?? "a new installation"}.`,
    `5. FAQ reel or post: what is included from templating to installation for ${services[4] ?? services[0] ?? "a typical project"}.`
  ].join("\n");
}

function getWeeklyWinsFallback(context: ChatWorkspaceContext) {
  if (context.weeklyReport.mode === "partial_live") {
    return [
      "Here is the trustworthy weekly readout from the current workspace:",
      `- Google Business live sync has ${getGoogleLocationCount(context)} location(s) and ${context.googleSummary.googleBusiness.reviews.length} synced review(s) cached locally.`,
      `- Meta live foundation currently shows ${context.metaSummary.facebookPages.length} Page(s), ${context.metaSummary.instagramAccounts.length} Instagram account(s), and ${context.metaSummary.adAccounts.length} ad account(s) if you use Meta.`,
      "- Google Ads, GA4, Search Console, and Meta leads still need dedicated reporting sync, so I would not claim spend saved, calls, clicks, or lead totals yet.",
      "- Best next move: use the synced Google Business footprint for reviews and posts first, then expand reporting after more live layers are wired."
    ].join("\n");
  }

  if (!context.readiness.google.isConnected) {
    return [
      "There is no trustworthy weekly win report yet.",
      "- Google is not connected, so DreamGrowth does not have live Google Business data to summarize.",
      "- Connect Google and run the first sync first.",
      "- Until then, I will not present sample ads, calls, clicks, or review totals as real results."
    ].join("\n");
  }

  const googleSyncDiagnostic = getGoogleSyncDiagnostic(context.readiness.google);

  return [
    "There is not a trustworthy weekly win report yet.",
    "- A Google account is connected, but the first live Google Business sync has not completed.",
    googleSyncDiagnostic
      ? `- Fix the current Google-side blocker first: ${googleSyncDiagnostic.hint}`
      : "- Finish the first sync, verify the locations and reviews that land in the workspace, and then the weekly readout can use real data.",
    "- I will not treat guided sample totals for ads, calls, clicks, reviews, or posts as facts."
  ].join("\n");
}

function getAdsAndVisibilityFallback(
  normalizedMessage: string,
  context: ChatWorkspaceContext
) {
  if (containsAny(normalizedMessage, ["ga4", "search console", "traffic", "clicks"])) {
    return [
      "I cannot verify live GA4 or Search Console performance from this workspace yet.",
      "- Those syncs are still pending, so I should not claim traffic, calls, query gains, or click trends as fact.",
      "- Safe next checks: confirm conversion tracking manually, review your top landing pages, and export the last 28 days of search queries outside DreamGrowth if you need a manual review.",
      `- Current Google workspace status: ${getGoogleWorkspaceStatus(context)}`
    ].join("\n");
  }

  return [
    "I cannot confirm live Google Ads waste or lead quality from DreamGrowth yet.",
    "- Google Ads sync is not live, so I should not claim wasted spend, search term problems, or budget recommendations as facts.",
    "- Safe next checks: review the last 30 days of search terms manually, confirm call and form conversions are tracking, and hold budget increases until conversion quality is clear.",
    `- Current Google workspace status: ${getGoogleWorkspaceStatus(context)}`
  ].join("\n");
}

function getReviewWorkflowFallback(context: ChatWorkspaceContext) {
  if (context.readiness.google.metadata.liveSync) {
    return [
      `DreamGrowth currently has ${context.googleSummary.googleBusiness.reviews.length} live Google review(s) synced into the workspace.`,
      "- Start with the newest 4-star or 5-star review first.",
      "- Keep the reply specific but factual: thank them, mention only a real detail, and invite them back.",
      "- If you want, paste one exact review and I can turn it into a safer owner-approval draft."
    ].join("\n");
  }

  return [
    "I do not have live Google reviews synced in the workspace yet.",
    "- Run the first Google sync so DreamGrowth can pull the real review list.",
    "- After that, pick the newest positive review first and draft the response from the actual text.",
    "- Until sync is live, use only generic review templates and add real job details manually."
  ].join("\n");
}

function getReviewReplyFallback(context: ChatWorkspaceContext) {
  const primaryService = context.companyProfile.services[0] ?? "your project";

  return [
    "Here is a safe review reply draft:",
    `Hi [Name], thank you for choosing ${context.companyProfile.companyName}. We really appreciate your feedback and are glad you had a positive experience. If you ever need help with ${primaryService} again, we are here to help.`,
    "Trust check: add only real job details from the actual review, or leave them out."
  ].join("\n");
}

function getGoogleWorkspaceStatus(context: ChatWorkspaceContext) {
  if (!context.readiness.google.isConnected) {
    return "Google is not connected yet.";
  }

  if (!context.readiness.google.metadata.liveSync) {
    const googleSyncDiagnostic = getGoogleSyncDiagnostic(context.readiness.google);
    return googleSyncDiagnostic
      ? `a Google account is connected, but sync is blocked: ${googleSyncDiagnostic.hint}`
      : "a Google account is connected, but there is no completed live Google Business sync yet.";
  }

  return `Google Business live sync is active with ${getGoogleLocationCount(
    context
  )} location(s) and ${
    context.googleSummary.googleBusiness.reviews.length
  } synced review(s).`;
}

function getGoogleWorkspaceStatusSpanish(context: ChatWorkspaceContext) {
  if (!context.readiness.google.isConnected) {
    return "Google todavia no esta conectada.";
  }

  if (!context.readiness.google.metadata.liveSync) {
    const googleSyncDiagnostic = getGoogleSyncDiagnostic(context.readiness.google);
    return googleSyncDiagnostic
      ? `hay una cuenta Google conectada, pero el sync esta bloqueado: ${googleSyncDiagnostic.hint}`
      : "hay una cuenta Google conectada, pero todavia no existe un live sync completo de Google Business.";
  }

  return `Google Business ya tiene live sync con ${getGoogleLocationCount(
    context
  )} ubicacion(es) y ${
    context.googleSummary.googleBusiness.reviews.length
  } resena(s) sincronizadas.`;
}

function getGoogleLocationCount(context: ChatWorkspaceContext) {
  return readNumericMetric(context.googleSummary.googleBusiness.metrics, "Locations");
}

function readNumericMetric(
  metrics: Array<{ label: string; value: string }>,
  label: string
) {
  const metric = metrics.find((item) => item.label === label);
  const value = Number(metric?.value ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function containsAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}

function detectPreferredLanguage(messages: ChatMessage[]) {
  const latestUserMessage =
    [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const normalized = latestUserMessage.toLowerCase();
  const spanishSignals = [
    "que",
    "como",
    "google",
    "resena",
    "mejora",
    "hoy",
    "conect",
    "sincron",
    "trafico",
    "quiero",
    "puedes"
  ];

  return spanishSignals.some((signal) => normalized.includes(signal))
    ? "es"
    : "en";
}

function getProviderStatus(error: unknown) {
  if (typeof error === "object" && error && "status" in error) {
    const status = error.status;
    return typeof status === "number" ? status : null;
  }

  if (typeof error === "object" && error && "cause" in error) {
    const cause = error.cause;

    if (typeof cause === "object" && cause && "status" in cause) {
      const status = cause.status;
      return typeof status === "number" ? status : null;
    }
  }

  if (error instanceof Error) {
    const match = error.message.match(/\b([45]\d{2})\b/);
    return match ? Number(match[1]) : null;
  }

  return null;
}

import { isAppProtectionEnabled } from "@/lib/auth";
import { getOptionalEnv } from "@/lib/env";
import {
  getIntegrationConnection,
  type IntegrationConnection
} from "@/lib/integrations/store";
import { getGoogleIntegrationReadiness } from "@/lib/oauth/google";
import { getMetaIntegrationReadiness } from "@/lib/oauth/meta";

export type AppReadiness = {
  google: IntegrationConnection;
  meta: IntegrationConnection;
  googleCredentialsReady: boolean;
  metaCredentialsReady: boolean;
  aiProvider: string;
  aiReady: boolean;
  appProtected: boolean;
};

export function getAppReadiness(): AppReadiness {
  const aiProvider = getOptionalEnv("AI_PROVIDER") ?? "gemini";
  const googleReadiness = getGoogleIntegrationReadiness();
  const metaReadiness = getMetaIntegrationReadiness();
  const googleCredentialsReady =
    googleReadiness.clientId &&
    googleReadiness.clientSecret &&
    googleReadiness.redirectUri;
  const metaCredentialsReady =
    metaReadiness.appId && metaReadiness.appSecret && metaReadiness.redirectUri;
  const aiReady =
    aiProvider === "openai"
      ? Boolean(getOptionalEnv("OPENAI_API_KEY"))
      : Boolean(getOptionalEnv("GEMINI_API_KEY"));

  return {
    google: getIntegrationConnection("google"),
    meta: getIntegrationConnection("meta"),
    googleCredentialsReady,
    metaCredentialsReady,
    aiProvider,
    aiReady,
    appProtected: isAppProtectionEnabled()
  };
}

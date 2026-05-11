import { NextResponse } from "next/server";
import {
  disconnectIntegration,
  type IntegrationProvider
} from "@/lib/integrations/store";

const supportedProviders = new Set<IntegrationProvider>(["google", "meta"]);

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;

  if (!supportedProviders.has(provider as IntegrationProvider)) {
    return NextResponse.json({ error: "Unsupported provider." }, { status: 404 });
  }

  disconnectIntegration(provider as IntegrationProvider);

  return NextResponse.redirect(
    new URL(`/settings?${provider}=disconnected`, request.url)
  );
}

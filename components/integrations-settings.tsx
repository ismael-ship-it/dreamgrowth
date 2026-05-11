import {
  Bot,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  ShieldCheck,
  Store,
  Target
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSetupForm } from "@/components/admin-setup-form";
import { getOptionalEnv } from "@/lib/env";
import { getGoogleIntegrationReadiness } from "@/lib/oauth/google";
import { getMetaIntegrationReadiness } from "@/lib/oauth/meta";

export function IntegrationsSettings() {
  const google = getGoogleIntegrationReadiness();
  const meta = getMetaIntegrationReadiness();
  const aiProvider = getOptionalEnv("AI_PROVIDER") ?? "gemini";
  const aiReady =
    aiProvider === "gemini"
      ? Boolean(getOptionalEnv("GEMINI_API_KEY"))
      : Boolean(getOptionalEnv("OPENAI_API_KEY"));
  const googleReady = Object.values(google).every(Boolean);
  const metaReady = Object.values(meta).every(Boolean);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <p className="text-sm font-bold text-accent-foreground">
          Connect DreamGrowth
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Connect your accounts in a few clicks
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Start with Google so DreamGrowth can read your reviews, profile
          activity, ad search terms, and visibility signals. Nothing gets posted
          or changed without your approval.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.9fr]">
        <UserConnectionCard
          title="Google"
          icon={Store}
          description="Reviews, Google Business Profile, Google Ads, GA4, and Search Console."
          recommended
          ready={googleReady}
          href="/api/oauth/google/start"
          setupMessage="Google connection is not configured yet. Add Google OAuth credentials once, then this becomes a one-click connect button."
          benefits={[
            "Read Google reviews",
            "Find wasted ad spend",
            "Create today's Growth Stack"
          ]}
        />
        <UserConnectionCard
          title="Meta"
          icon={Target}
          description="Facebook Pages, Instagram Business, Meta Ads, leads, and future inbox."
          ready={metaReady}
          href="/api/oauth/meta/start"
          setupMessage="Meta connection is not configured yet. Add Meta app credentials after Google is working."
          benefits={[
            "Draft Facebook posts",
            "Draft Instagram captions",
            "Track Meta leads"
          ]}
        />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-accent-foreground" />
              AI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Uses {aiProvider} to generate daily tasks, review replies, wasted
              spend analysis, and local post drafts.
            </p>
            <Badge variant={aiReady ? "success" : "warning"}>
              {aiReady ? "Ready" : "Admin setup needed"}
            </Badge>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/daily-stack">
                <KeyRound className="h-4 w-4" />
                View Daily Stack
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
          <div className="text-sm font-semibold leading-6">
            DreamGrowth can recommend actions. You still approve before it
            replies to reviews, publishes posts, changes ads, or schedules
            anything.
          </div>
        </CardContent>
      </Card>

      <AdminSetupForm />
    </div>
  );
}

function UserConnectionCard({
  title,
  icon: Icon,
  description,
  recommended,
  ready,
  href
  ,
  setupMessage,
  benefits
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  recommended?: boolean;
  ready: boolean;
  href: string;
  setupMessage: string;
  benefits: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-accent-foreground" />
            {title}
          </span>
          <Badge variant={ready ? "success" : "warning"}>
            {ready ? "Ready" : "Setup needed"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommended ? <Badge variant="success">Start here</Badge> : null}
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="space-y-2">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
              <span className="font-semibold">{benefit}</span>
            </div>
          ))}
        </div>
        {ready ? (
          <Button asChild className="w-full">
            <Link href={href}>
              Connect {title}
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div className="rounded-md bg-muted p-3 text-sm font-semibold leading-6 text-muted-foreground">
            {setupMessage}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

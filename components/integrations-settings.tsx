import type * as React from "react";
import {
  Bot,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  ShieldCheck,
  Store,
  Target,
  Unplug
} from "lucide-react";
import Link from "next/link";
import { getCompanyProfile } from "@/lib/company/profile";
import { getAppReadiness } from "@/lib/app-readiness";
import { getMeaningfulConnectionName } from "@/lib/integrations/display-name";
import {
  type IntegrationConnection,
  type IntegrationProvider
} from "@/lib/integrations/store";
import { CompanyProfileForm } from "@/components/company-profile-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSetupForm } from "@/components/admin-setup-form";

type StatusQueries = {
  google?: string;
  meta?: string;
};

export function IntegrationsSettings({
  statusQueries
}: {
  statusQueries?: StatusQueries;
}) {
  const readiness = getAppReadiness();
  const companyProfile = getCompanyProfile();

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
          Start with Google so DreamGrowth can read your reviews, locations, and
          profile activity first. Nothing gets posted or changed without your
          approval.
        </p>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-muted-foreground">
          Day-to-day use should happen through connected accounts below. The app
          credentials section is only a one-time advanced setup layer.
        </p>
      </section>

      <StatusNotice provider="google" code={statusQueries?.google} />
      <StatusNotice provider="meta" code={statusQueries?.meta} />

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_0.9fr]">
        <UserConnectionCard
          provider="google"
          title="Google"
          icon={Store}
          description="Reviews, Google Business Profile, Google Ads, GA4, and Search Console."
          recommended
          credentialsReady={readiness.googleCredentialsReady}
          connection={readiness.google}
          href="/api/oauth/google/start"
          setupMessage="Google connection is not configured yet. Add Google OAuth credentials once, then this becomes a one-click connect button."
          benefits={[
            "Read Google reviews",
            "See locations and profile state",
            "Create today's Growth Stack"
          ]}
        />
        <UserConnectionCard
          provider="meta"
          title="Meta"
          icon={Target}
          description="Facebook Pages, Instagram Business, Meta Ads, leads, and future inbox."
          credentialsReady={readiness.metaCredentialsReady}
          connection={readiness.meta}
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
              App Readiness
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">AI Provider</span>
                <Badge variant={readiness.aiReady ? "success" : "warning"}>
                  {readiness.aiReady ? "Ready" : "Needs key"}
                </Badge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                DreamGrowth is set to use <strong>{readiness.aiProvider}</strong>{" "}
                for daily tasks, review replies, wasted spend analysis, and local
                post drafts.
              </p>
            </div>
            <div className="space-y-2 rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold">Owner access</span>
                <Badge variant={readiness.appProtected ? "success" : "warning"}>
                  {readiness.appProtected ? "Protected" : "Open in dev"}
                </Badge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {readiness.appProtected
                  ? "The app now requires the owner session cookie before anyone can open dashboards or APIs."
                  : "Set DREAMGROWTH_APP_PASSWORD before public deployment so the dashboard and APIs are locked."}
              </p>
            </div>
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
            DreamGrowth stores OAuth tokens locally in encrypted app storage,
            recommends actions, and still requires owner approval before it
            replies to reviews, publishes posts, changes ads, or schedules
            anything.
          </div>
        </CardContent>
      </Card>

      <CompanyProfileForm initialProfile={companyProfile} />

      <AdminSetupForm />
    </div>
  );
}

function StatusNotice({
  provider,
  code
}: {
  provider: "google" | "meta";
  code?: string;
}) {
  const message = getStatusMessage(provider, code);

  if (!message) {
    return null;
  }

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
        message.tone === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-950"
          : "border-amber-200 bg-amber-50 text-amber-950"
      }`}
    >
      {message.text}
    </div>
  );
}

function UserConnectionCard({
  provider,
  title,
  icon: Icon,
  description,
  recommended,
  credentialsReady,
  connection,
  href,
  setupMessage,
  benefits
}: {
  provider: IntegrationProvider;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  recommended?: boolean;
  credentialsReady: boolean;
  connection: IntegrationConnection;
  href: string;
  setupMessage: string;
  benefits: string[];
}) {
  const pages = Array.isArray(connection.metadata.pages)
    ? (connection.metadata.pages as Array<{ name?: string }>)
    : [];
  const accounts = Array.isArray(connection.metadata.accounts)
    ? (connection.metadata.accounts as Array<{ name?: string }>)
    : [];
  const badge = connection.isConnected
    ? { label: "Connected", variant: "success" as const }
    : credentialsReady
      ? { label: "Ready to connect", variant: "outline" as const }
      : { label: "Setup needed", variant: "warning" as const };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-accent-foreground" />
            {title}
          </span>
          <Badge variant={badge.variant}>{badge.label}</Badge>
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

        {connection.isConnected ? (
          <div className="space-y-3 rounded-md border border-emerald-200 bg-emerald-50/80 p-3">
            <div className="text-sm font-bold text-emerald-950">
              Connected as{" "}
              {getMeaningfulConnectionName(connection.displayName) ??
                `your ${title} account`}
            </div>
            {connection.connectedAt ? (
              <p className="text-xs font-semibold text-emerald-900/80">
                Connected on {formatDate(connection.connectedAt)}
              </p>
            ) : null}
            {accounts.length ? (
              <p className="text-xs font-semibold text-emerald-900/80">
                {accounts.length} Google Business account
                {accounts.length === 1 ? "" : "s"} discovered.
              </p>
            ) : null}
            {pages.length ? (
              <p className="text-xs font-semibold text-emerald-900/80">
                {pages.length} Facebook Page{pages.length === 1 ? "" : "s"} found:
                {" "}
                {pages
                  .map((page) => page.name)
                  .filter(Boolean)
                  .slice(0, 3)
                  .join(", ")}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button asChild className="flex-1">
                <Link href={href}>
                  Reconnect {title}
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
              <form
                action={`/api/integrations/${provider}/disconnect`}
                method="post"
                className="flex-1"
              >
                <Button type="submit" variant="outline" className="w-full">
                  <Unplug className="h-4 w-4" />
                  Disconnect
                </Button>
              </form>
            </div>
          </div>
        ) : credentialsReady ? (
          <div className="space-y-3 rounded-md border border-border bg-muted/40 p-3">
            <div className="text-sm font-bold">App credentials are ready</div>
            <p className="text-sm leading-6 text-muted-foreground">
              The technical setup for {title} is already saved. The next step is
              the real business account connection.
            </p>
            <Button asChild className="w-full">
              <Link href={href}>
                Connect {title}
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-md bg-muted p-3 text-sm font-semibold leading-6 text-muted-foreground">
            {setupMessage} Open the advanced setup section below only if those
            credentials have not been saved yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusMessage(provider: "google" | "meta", code?: string) {
  if (!code) {
    return null;
  }

  const title = provider === "google" ? "Google" : "Meta";
  const messages = {
    connected: {
      tone: "success" as const,
      text: `${title} connected and saved locally. DreamGrowth will remember this account the next time the app starts.`
    },
    disconnected: {
      tone: "warning" as const,
      text: `${title} was disconnected from local app storage.`
    },
    setup_required: {
      tone: "warning" as const,
      text: `${title} cannot connect yet because the OAuth credentials are still missing in Admin Setup.`
    },
    invalid_state: {
      tone: "warning" as const,
      text: `${title} OAuth state was invalid. Try the connection flow again from this page.`
    },
    oauth_error: {
      tone: "warning" as const,
      text: `${title} OAuth did not complete. The authorization request was interrupted or rejected.`
    },
    token_exchange_failed: {
      tone: "warning" as const,
      text: `${title} returned to DreamGrowth, but token exchange failed. Double-check the redirect URI and app credentials.`
    }
  };

  return messages[code as keyof typeof messages] ?? null;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

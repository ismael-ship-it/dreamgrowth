import type * as React from "react";
import Link from "next/link";
import {
  ExternalLink,
  RefreshCw,
  MessageSquareText,
  Phone,
  Route,
  Star,
  Store,
  Upload
} from "lucide-react";
import type { GoogleIntegrationSummary } from "@/lib/google/types";
import { getMeaningfulConnectionName } from "@/lib/integrations/display-name";
import type { IntegrationConnection } from "@/lib/integrations/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GoogleBusinessManager({
  summary,
  connection,
  syncStatus,
  syncReason
}: {
  summary: GoogleIntegrationSummary;
  connection: IntegrationConnection;
  syncStatus?: "success" | "failed";
  syncReason?: string;
}) {
  const { metrics, reviews, postDrafts } = summary.googleBusiness;
  const accounts = Array.isArray(connection.metadata.accounts)
    ? (connection.metadata.accounts as Array<{ name?: string }>)
    : [];
  const lastSyncError = readGoogleSyncError(connection.metadata);
  const syncFailureMessage = getGoogleSyncFailureMessage(syncReason);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold text-accent-foreground">
              Google Business Profile
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Turn local profile activity into action
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Reviews, calls, directions, profile views, photos, and post drafts
              are converted into owner-approved tasks.
            </p>
          </div>
          <Badge variant={connection.isConnected ? "success" : "warning"}>
            {connection.isConnected ? "Connected" : "Not connected"}
          </Badge>
        </div>
      </section>

      {syncStatus ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
            syncStatus === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-950"
              : "border-amber-200 bg-amber-50 text-amber-950"
          }`}
        >
          {syncStatus === "success"
            ? "Google sync completed. The page is now using the latest live Google Business snapshot available to DreamGrowth."
            : syncFailureMessage}
        </div>
      ) : null}

      {lastSyncError ? (
        <Card className="border-amber-200 bg-amber-50/80">
          <CardContent className="space-y-2 p-4">
            <div className="text-sm font-bold text-amber-950">
              Last sync diagnostic
            </div>
            <p className="text-sm leading-6 text-amber-950">
              {lastSyncError.message}
            </p>
            <p className="text-xs font-semibold text-amber-900/90">
              Stage: {lastSyncError.stage} | Status:{" "}
              {lastSyncError.status ?? "unknown"} | Reason: {lastSyncError.reason}
            </p>
            <p className="text-xs font-semibold leading-5 text-amber-900/90">
              Next move: {lastSyncError.hint}
            </p>
            {lastSyncError.helpUrl ? (
              <Button asChild size="sm" variant="outline">
                <a
                  href={lastSyncError.helpUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Google API setup
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {connection.isConnected ? (
        <Card>
          <CardContent className="space-y-2 p-4">
            <div className="text-sm font-bold">
              Connected as{" "}
              {getMeaningfulConnectionName(connection.displayName) ??
                "your Google account"}
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              DreamGrowth saved your Google OAuth connection locally and can now
              remember it between sessions.
            </p>
            {accounts.length ? (
              <p className="text-xs font-semibold text-muted-foreground">
                Google Business accounts found:{" "}
                {accounts
                  .map((account) => account.name)
                  .filter(Boolean)
                  .join(", ")}
              </p>
            ) : null}
            <p className="text-xs font-semibold text-muted-foreground">
              {summary.approvalRule}
            </p>
            <form action="/api/google/sync" method="post" className="pt-2">
              <Button type="submit" size="sm">
                <RefreshCw className="h-4 w-4" />
                Sync Google now
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-3 p-5">
            <div className="text-lg font-black">Google is not connected yet</div>
            <p className="text-sm leading-6 text-muted-foreground">
              Connect Google in Settings first. That is the highest-value source
              because it unlocks reviews, locations, and profile activity first.
            </p>
            <Button asChild>
              <Link href="/settings">Open Settings</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {connection.isConnected ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase text-muted-foreground">
                        {metric.label}
                      </div>
                      <div className="mt-2 text-2xl font-black">{metric.value}</div>
                      <div className="mt-1 text-xs font-medium text-muted-foreground">
                        {metric.trend}
                      </div>
                    </div>
                    <Store className="h-5 w-5 text-accent-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle>Review Response Drafts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviews.length ? (
                  reviews.map((review) => (
                    <div key={review.id} className="rounded-md border border-border p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="success">
                          <Star className="mr-1 h-3 w-3" />
                          {review.rating} stars
                        </Badge>
                        <Badge variant="warning">Approval required</Badge>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {review.comment}
                      </p>
                      <p className="mt-3 text-sm font-semibold leading-6">
                        {review.responseDraft}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button asChild size="sm">
                          <Link href="/reviews">
                            <MessageSquareText className="h-4 w-4" />
                            Open Reviews Workflow
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href="/growth-chat">
                            Refine in Growth Chat
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyMessage text="No live Google reviews were returned yet for the connected locations." />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>GBP Post Drafts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {postDrafts.length ? (
                  postDrafts.map((post) => (
                    <div key={post.id} className="rounded-md border border-border p-4">
                      <Badge variant="warning">Pending approval</Badge>
                      <h3 className="mt-3 text-base font-bold">{post.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {post.body}
                      </p>
                      <p className="mt-3 text-xs font-semibold text-muted-foreground">
                        Source: {post.sourcePhoto}
                      </p>
                      <Button asChild className="mt-4" size="sm">
                        <Link href="/content">Open Content Workflow</Link>
                      </Button>
                    </div>
                  ))
                ) : (
                  <EmptyMessage text="No Google Business post drafts are ready yet. The live sync layer is focused on accounts, locations, and reviews first." />
                )}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-3 md:grid-cols-3">
            <Action icon={Upload} text="Fetch posts and photos when the API allows it." />
            <Action icon={Phone} text="Track calls, website clicks, profile views, and directions." />
            <Action icon={Route} text="Create owner-approved tasks from profile activity gaps." />
          </section>
        </>
      ) : null}
    </div>
  );
}

function getGoogleSyncFailureMessage(reason?: string) {
  switch (reason) {
    case "refresh_token_missing":
      return "Google sync failed because the stored refresh token is missing. Reconnect Google in Settings, then run sync again.";
    case "token_expired":
      return "Google sync failed because the Google access token is no longer valid. Reconnect Google in Settings and try sync again.";
    case "api_forbidden":
      return "Google sync failed because this OAuth app can connect, but it still does not have permission to read the Google Business data needed for sync. Check that Business Profile APIs are enabled and that this account has access to the listing.";
    case "api_not_enabled":
      return "Google sync failed because one of the Google Business APIs is not enabled for this OAuth app yet. Enable the Business Profile APIs in Google Cloud, then try again.";
    case "rate_limited":
      return "Google sync hit a Google rate limit. Wait a minute, then run sync again.";
    default:
      return "Google sync failed. Reconnect the account or check whether the Google Business APIs are enabled for this OAuth app.";
  }
}

function readGoogleSyncError(metadata: Record<string, unknown>) {
  const value = metadata.lastSyncError;

  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as {
    reason?: string;
    stage?: string;
    status?: number | null;
    message?: string;
    hint?: string;
    helpUrl?: string | null;
  };

  if (!candidate.message || !candidate.reason) {
    return null;
  }

  return {
    reason: candidate.reason,
    stage: candidate.stage ?? "unknown",
    status:
      typeof candidate.status === "number" || candidate.status === null
        ? candidate.status
        : null,
    message: candidate.message,
    hint: candidate.hint ?? "Reconnect Google and check the Business Profile APIs.",
    helpUrl: typeof candidate.helpUrl === "string" ? candidate.helpUrl : null
  };
}

function EmptyMessage({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-4 text-sm font-semibold leading-6 text-muted-foreground">
      {text}
    </div>
  );
}

function Action({
  icon: Icon,
  text
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
        <div className="text-sm font-semibold leading-6">{text}</div>
      </CardContent>
    </Card>
  );
}

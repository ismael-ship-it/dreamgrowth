import Link from "next/link";
import { GrowthTaskCard } from "@/components/growth-task-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMeaningfulConnectionName } from "@/lib/integrations/display-name";
import {
  getGoogleConnection,
  getGoogleIntegrationSummary
} from "@/lib/google/service";
import { getMetaConnection, getMetaIntegrationSummary } from "@/lib/meta/service";
import {
  buildOperatorDailyStack,
  type DailyStackResult
} from "@/lib/task-engine";

export default async function DailyStackPage() {
  const [google, meta, googleConnection, metaConnection] = await Promise.all([
    getGoogleIntegrationSummary(),
    getMetaIntegrationSummary(),
    Promise.resolve(getGoogleConnection()),
    Promise.resolve(getMetaConnection())
  ]);
  const result = buildOperatorDailyStack({
    google,
    meta,
    googleConnection,
    metaConnection
  });
  const hero = buildHero(result);
  const setupAlert = buildSetupAlert(result);
  const taskCountLabel =
    result.tasks.length === 1
      ? "1 next move"
      : `${result.tasks.length} next moves`;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <p className="text-sm font-bold text-accent-foreground">Daily Stack</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="success">Focus: Google Business first</Badge>
          <Badge variant={result.summary.googleLiveSync ? "success" : "outline"}>
            {result.summary.googleLiveSync ? "Live signals on" : "Setup mode"}
          </Badge>
          <Badge variant="outline">No auto-execution</Badge>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight">{hero.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          {hero.body}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link href={hero.primaryHref}>{hero.primaryLabel}</Link>
          </Button>
          {hero.secondaryHref && hero.secondaryLabel ? (
            <Button asChild variant="outline">
              <Link href={hero.secondaryHref}>{hero.secondaryLabel}</Link>
            </Button>
          ) : null}
        </div>
        <p className="mt-4 text-sm font-semibold text-muted-foreground">
          {result.note}
        </p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {result.approvalRule}
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StackStat
          label="Google connection"
          value={
            result.summary.googleConnected
              ? getMeaningfulConnectionName(result.summary.googleDisplayName) ??
                "Connected"
              : "Not connected"
          }
          note={
            result.summary.googleConnected
              ? "Owner account saved for this workspace"
              : "Daily Stack is waiting on Google setup"
          }
        />
        <StackStat
          label="Live reviews"
          value={
            result.summary.googleLiveSync
              ? String(result.summary.reviewCount)
              : "Waiting on sync"
          }
          note={
            result.summary.lowRatingReviewCount > 0
              ? `${result.summary.lowRatingReviewCount} low-rating review(s) should go first`
              : "Count is based only on the stored Google snapshot"
          }
        />
        <StackStat
          label="GBP post drafts"
          value={
            result.summary.googleLiveSync
              ? String(result.summary.postDraftCount)
              : "Waiting on sync"
          }
          note={
            result.summary.postDraftCount > 0
              ? "Ready for owner review"
              : "No live draft is stored yet"
          }
        />
        <StackStat
          label="Pending lanes"
          value={joinLabels(result.summary.pendingLanes)}
          note="Explicitly pending until the Google Business loop feels trustworthy"
        />
      </section>

      {setupAlert ? (
        <Card className="border-border/80 bg-background/70">
          <CardContent className="space-y-3 p-5">
            <div className="text-lg font-black">{setupAlert.title}</div>
            <p className="text-sm leading-6 text-muted-foreground">
              {setupAlert.body}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={setupAlert.primaryHref}>{setupAlert.primaryLabel}</Link>
              </Button>
              {setupAlert.secondaryHref && setupAlert.secondaryLabel ? (
                <Button asChild variant="outline">
                  <Link href={setupAlert.secondaryHref}>
                    {setupAlert.secondaryLabel}
                  </Link>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold text-accent-foreground">
              Ranked for the current product
            </p>
            <h2 className="text-2xl font-black tracking-tight">
              {taskCountLabel} from real Google state
            </h2>
          </div>
          <p className="text-sm font-semibold text-muted-foreground">
            Other channels stay pending until Google Business feels easy to trust.
          </p>
        </div>
        <div className="space-y-3">
          {result.tasks.map((task, index) => (
            <GrowthTaskCard key={task.id} task={task} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StackStat({
  label,
  value,
  note
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-bold uppercase text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 text-lg font-black">{value}</div>
        <div className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
          {note}
        </div>
      </CardContent>
    </Card>
  );
}

function buildHero(result: DailyStackResult) {
  switch (result.mode) {
    case "google_not_connected":
      return {
        title: "Connect Google before trusting Daily Stack",
        body:
          "Daily Stack is intentionally narrowed to the Google Business operator. Until the owner Google account is connected, DreamGrowth should only surface setup work and product boundaries.",
        primaryLabel: "Open Settings",
        primaryHref: "/settings",
        secondaryLabel: "Open Connect",
        secondaryHref: "/connect"
      };
    case "google_scope_needed":
      return {
        title: "Reconnect Google with Business access",
        body:
          "The account is saved, but the Google Business permission is missing. DreamGrowth should not rank reviews or post work as live until that access is restored.",
        primaryLabel: "Reconnect in Settings",
        primaryHref: "/settings",
        secondaryLabel: "Open Connect",
        secondaryHref: "/connect"
      };
    case "google_sync_needed":
      return {
        title: "Run the first live Google sync",
        body:
          "Google is connected, but Daily Stack still needs the first real snapshot of accounts, locations, reviews, and draft context before it can rank operator work honestly.",
        primaryLabel: "Open Google Business",
        primaryHref: "/google-business",
        secondaryLabel: "Review Settings",
        secondaryHref: "/settings"
      };
    case "google_live":
      return {
        title:
          result.summary.lowRatingReviewCount > 0
            ? "Start with the live Google review queue"
            : "Work the live Google stack first",
        body:
          "This stack is now grounded in the stored Google Business snapshot. Review work stays manual, while Google Ads, GA4, Search Console, and Meta remain explicitly pending here.",
        primaryLabel:
          result.summary.reviewCount > 0 ? "Open Reviews" : "Open Google Business",
        primaryHref: result.summary.reviewCount > 0 ? "/reviews" : "/google-business",
        secondaryLabel: "Open Google Business",
        secondaryHref: "/google-business"
      };
  }
}

function buildSetupAlert(result: DailyStackResult) {
  switch (result.mode) {
    case "google_not_connected":
      return {
        title: "No live Google data is connected yet",
        body:
          "Daily Stack will not invent review, post, or profile tasks until the owner Google account exists in this workspace. Connect Google first, then come back for the real operator queue.",
        primaryLabel: "Open Settings",
        primaryHref: "/settings",
        secondaryLabel: "Open Connect",
        secondaryHref: "/connect"
      };
    case "google_scope_needed":
      return {
        title: "Google Business permission is still missing",
        body:
          "The connected account is not enough on its own. Daily Stack needs Google Business scope to read reviews and build trustworthy next actions from the real listing.",
        primaryLabel: "Reconnect Google",
        primaryHref: "/settings",
        secondaryLabel: "Open Connect",
        secondaryHref: "/connect"
      };
    case "google_sync_needed":
      return {
        title: "Daily Stack is waiting on the first stored snapshot",
        body:
          "Run Sync Google now inside Google Business before you trust any ranking here. Until then, setup guidance is the most honest output the product can give you.",
        primaryLabel: "Open Google Business",
        primaryHref: "/google-business",
        secondaryLabel: "Review Settings",
        secondaryHref: "/settings"
      };
    case "google_live":
      return null;
  }
}

function joinLabels(values: string[]) {
  if (values.length === 0) {
    return "None";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

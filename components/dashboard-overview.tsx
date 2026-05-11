import Link from "next/link";
import {
  ArrowRight,
  Cable,
  ClipboardCheck,
  RefreshCw,
  type LucideIcon
} from "lucide-react";
import { getAppReadiness } from "@/lib/app-readiness";
import { getMeaningfulConnectionName } from "@/lib/integrations/display-name";
import {
  getGoogleSyncDiagnostic,
  getGoogleSyncDiagnosticTitle
} from "@/lib/google/sync-diagnostics";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StepState = "complete" | "active" | "waiting";

type MissionStep = {
  title: string;
  summary: string;
  detail: string;
  status: string;
  state: StepState;
  badgeVariant: "default" | "success" | "warning" | "outline";
  href: string;
  cta: string;
  ctaVariant: "default" | "outline";
  icon: LucideIcon;
};

export function DashboardOverview() {
  const readiness = getAppReadiness();
  const googleLiveSync = Boolean(readiness.google.metadata.liveSync);
  const googleDiagnostic = getGoogleSyncDiagnostic(readiness.google);
  const steps = buildMissionSteps(readiness);
  const nextStep = steps.find((step) => step.state === "active") ?? steps[2];
  const completedCount = steps.filter((step) => step.state === "complete").length;
  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date());
  const statusRows = [
    {
      label: "Google connection",
      value: readiness.google.isConnected
        ? getMeaningfulConnectionName(readiness.google.displayName) ?? "Connected"
        : "Not connected"
    },
    {
      label: "Live foundation",
      value: googleLiveSync
        ? "Accounts, locations, and reviews synced"
        : "First sync still pending"
    },
    {
      label: "First action lane",
      value: googleLiveSync
        ? "Ready inside Google Business"
        : "Unlocks after the first sync"
    }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="grid gap-5 lg:grid-cols-[1.4fr_320px] lg:items-start">
          <div>
            <p className="text-sm font-bold text-accent-foreground">
              {todayLabel}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="success">Focus: Google Business Operator</Badge>
              <Badge variant={googleLiveSync ? "success" : "outline"}>
                {googleLiveSync ? "Live foundation on" : "Live foundation pending"}
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Mission Control
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              {buildHeroBody(readiness, googleLiveSync)}
            </p>
            {googleDiagnostic ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/80 p-4 text-sm">
                <div className="font-bold text-amber-950">
                  {getGoogleSyncDiagnosticTitle(googleDiagnostic)}
                </div>
                <p className="mt-2 leading-6 text-amber-950">
                  {googleDiagnostic.hint}
                </p>
              </div>
            ) : null}
          </div>

          <Card className="border-border/70 bg-background/60 shadow-none">
            <CardContent className="p-5">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Next move
              </div>
              <div className="mt-2 text-xl font-black">{nextStep.title}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {nextStep.summary}
              </p>
              <Button
                asChild
                className="mt-4 w-full justify-between"
                variant={nextStep.ctaVariant}
              >
                <Link href={nextStep.href}>
                  <span>{nextStep.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <div className="mt-4 rounded-lg bg-muted p-3">
                <div className="text-xs font-bold uppercase text-muted-foreground">
                  Progress
                </div>
                <div className="mt-1 text-sm font-semibold">
                  {completedCount} of 3 steps completed
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {steps.map((step, index) => (
          <Card key={step.title} className={getStepCardClasses(step.state)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className={getStepIndexClasses(step.state)}>
                  0{index + 1}
                </div>
                <Badge variant={step.badgeVariant}>{step.status}</Badge>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <div className={getStepIconClasses(step.state)}>
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black tracking-tight">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {step.summary}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs font-semibold leading-5 text-muted-foreground">
                {step.detail}
              </p>

              <Button
                asChild
                className="mt-5 w-full justify-between"
                variant={step.ctaVariant}
              >
                <Link href={step.href}>
                  <span>{step.cta}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Operator Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusRows.map((row) => (
              <div
                key={row.label}
                className="rounded-lg border border-border bg-background/70 p-4"
              >
                <div className="text-xs font-bold uppercase text-muted-foreground">
                  {row.label}
                </div>
                <div className="mt-2 text-sm font-semibold">{row.value}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hidden Until Stable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm leading-6 text-muted-foreground">
              Google Ads, Meta, content, media, calendar, and reporting stay out
              of the primary navigation until the Google connect-sync-review loop
              feels solid with real data.
            </p>
            <div className="rounded-lg border border-dashed border-border bg-muted/60 p-4 text-sm font-semibold leading-6">
              Narrow scope now. Reopen more modules only after the first Google
              Business action is easy to trust and approve.
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function buildHeroBody(
  readiness: ReturnType<typeof getAppReadiness>,
  googleLiveSync: boolean
) {
  const googleDiagnostic = getGoogleSyncDiagnostic(readiness.google);

  if (!readiness.google.isConnected) {
    return "DreamGrowth is intentionally narrowed to one mission: connect the owner Google account first, because that is the fastest path to real local-intent data and the cleanest first operator loop.";
  }

  if (googleDiagnostic) {
    return "Google is connected, but the first live sync is still blocked by an external Google setup issue. DreamGrowth is now surfacing that blocker directly so the owner can resolve it and unlock the real operator loop.";
  }

  if (!googleLiveSync) {
    return "Google is already connected. Run one live sync next so DreamGrowth can store real Business accounts, locations, reviews, and the first reviewable actions in one place.";
  }

  return "The live Google foundation is in place. Review the first response or post draft inside Google Business, keep the workflow tight, and only then reopen broader surfaces.";
}

function buildMissionSteps(readiness: ReturnType<typeof getAppReadiness>) {
  const googleConnected = readiness.google.isConnected;
  const googleLiveSync = Boolean(readiness.google.metadata.liveSync);
  const googleDiagnostic = getGoogleSyncDiagnostic(readiness.google);
  const googleDisplayName =
    getMeaningfulConnectionName(readiness.google.displayName) ??
    "your Google owner account";

  const steps: MissionStep[] = [
    googleConnected
      ? {
          title: "Connect Google",
          summary: `Connected as ${googleDisplayName}. DreamGrowth can already remember this owner account between sessions.`,
          detail:
            "This is the highest-value foundation because it unlocks locations, reviews, and local search signals first.",
          status: "Complete",
          state: "complete",
          badgeVariant: "success",
          href: "/connect",
          cta: "Review connection",
          ctaVariant: "outline",
          icon: Cable
        }
      : {
          title: "Connect Google",
          summary: readiness.googleCredentialsReady
            ? "The OAuth credentials are ready. Complete the owner connect flow to unlock real Google Business accounts, locations, and reviews."
            : "Google OAuth credentials still need setup before the owner account can be connected.",
          detail: readiness.googleCredentialsReady
            ? "This is the only connection the operator needs first."
            : "Until credentials exist, the Google operator lane stays blocked.",
          status: readiness.googleCredentialsReady ? "Ready now" : "Setup required",
          state: "active",
          badgeVariant: readiness.googleCredentialsReady ? "outline" : "warning",
          href: "/connect",
          cta: readiness.googleCredentialsReady
            ? "Connect Google now"
            : "Open Google setup",
          ctaVariant: "default",
          icon: Cable
        },
    googleLiveSync
      ? {
          title: "Run first sync",
          summary:
            "The first live Google snapshot is already stored. Accounts, locations, and reviews can now feed the operator workspace.",
          detail:
            "DreamGrowth should now treat Google Business as a live foundation, not a guided placeholder.",
          status: "Complete",
          state: "complete",
          badgeVariant: "success",
          href: "/google-business",
          cta: "Open Google Business",
          ctaVariant: "outline",
          icon: RefreshCw
        }
      : googleConnected
        ? {
            title: googleDiagnostic ? "Fix Google sync blocker" : "Run first sync",
            summary: googleDiagnostic
              ? googleDiagnostic.message
              : "Google is connected. Run one live sync to pull Business accounts, locations, and reviews into DreamGrowth.",
            detail: googleDiagnostic
              ? googleDiagnostic.hint
              : "This is the move that takes the workspace from setup mode to real Google data.",
            status: googleDiagnostic ? "Blocked externally" : "Next step",
            state: "active",
            badgeVariant: googleDiagnostic ? "warning" : "default",
            href: googleDiagnostic?.helpUrl ? "/connect" : "/google-business",
            cta: googleDiagnostic ? "Open connection help" : "Run first sync",
            ctaVariant: "default",
            icon: RefreshCw
          }
        : {
            title: "Run first sync",
            summary:
              "The sync button unlocks right after Google is connected.",
            detail: "No live Google data is stored yet.",
            status: "Blocked",
            state: "waiting",
            badgeVariant: "outline",
            href: "/google-business",
            cta: "View Google workspace",
            ctaVariant: "outline",
            icon: RefreshCw
          },
    googleLiveSync
      ? {
          title: "Review first action",
          summary:
            "Open Google Business and review the first response draft or post draft created from live Google data.",
          detail:
            "Keep the first operator loop tight before reopening broader modules.",
          status: "Ready for review",
          state: "active",
          badgeVariant: "default",
          href: "/google-business",
          cta: "Review first action",
          ctaVariant: "default",
          icon: ClipboardCheck
        }
      : googleConnected
        ? {
            title: "Review first action",
            summary:
              "The first reviewable action appears immediately after the first live sync succeeds.",
            detail:
              "This step stays on hold until the operator has real Google data to work from.",
            status: "Waiting on sync",
            state: "waiting",
            badgeVariant: "outline",
            href: "/google-business",
            cta: "Open Google workspace",
            ctaVariant: "outline",
            icon: ClipboardCheck
          }
        : {
            title: "Review first action",
            summary:
              "DreamGrowth only surfaces the first action after Google is connected and synced once.",
            detail:
              "No extra branches yet, just the first operator win from Google Business.",
            status: "Blocked",
            state: "waiting",
            badgeVariant: "outline",
            href: "/dashboard",
            cta: "Stay in Mission Control",
            ctaVariant: "outline",
            icon: ClipboardCheck
          }
  ];

  return steps;
}

function getStepCardClasses(state: StepState) {
  if (state === "complete") {
    return "border-emerald-200 bg-emerald-50/40";
  }

  if (state === "active") {
    return "border-primary/40 bg-primary/5";
  }

  return "";
}

function getStepIndexClasses(state: StepState) {
  return cn(
    "flex h-10 w-10 items-center justify-center rounded-full text-sm font-black",
    state === "complete" &&
      "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
    state === "active" &&
      "bg-primary text-primary-foreground ring-1 ring-primary/20",
    state === "waiting" && "bg-muted text-muted-foreground"
  );
}

function getStepIconClasses(state: StepState) {
  return cn(
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg",
    state === "complete" && "bg-emerald-100 text-emerald-800",
    state === "active" && "bg-primary text-primary-foreground",
    state === "waiting" && "bg-muted text-muted-foreground"
  );
}

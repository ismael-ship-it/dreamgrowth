import {
  ArrowRight,
  Bot,
  Cable,
  Lock,
  Megaphone,
  Sparkles,
  Store,
  Workflow
} from "lucide-react";
import Link from "next/link";
import { getAppReadiness } from "@/lib/app-readiness";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SetupTask = {
  title: string;
  reason: string;
  badge: string;
  badgeVariant: "success" | "warning" | "outline";
  href: string;
  cta: string;
  ctaVariant: "default" | "outline";
};

export function DashboardOverview() {
  const readiness = getAppReadiness();
  const googleState = summarizeProvider(
    readiness.google.isConnected,
    readiness.googleCredentialsReady,
    readiness.google.displayName
  );
  const metaState = summarizeProvider(
    readiness.meta.isConnected,
    readiness.metaCredentialsReady,
    readiness.meta.displayName
  );
  const setupTasks = buildSetupTasks(readiness);
  const heroTitle = buildHeroTitle(readiness);
  const heroBody = buildHeroBody(readiness);
  const stats = [
    {
      label: "Google",
      value: googleState.value,
      detail: googleState.detail,
      icon: Store
    },
    {
      label: "Meta",
      value: metaState.value,
      detail: metaState.detail,
      icon: Megaphone
    },
    {
      label: "AI",
      value: readiness.aiReady ? "Ready" : "Needs key",
      detail: `${readiness.aiProvider} provider`,
      icon: Bot
    },
    {
      label: "Owner Access",
      value: readiness.appProtected ? "Protected" : "Open",
      detail: readiness.appProtected
        ? "password gate active"
        : "set app password before deployment",
      icon: Lock
    },
    {
      label: "Workflow",
      value:
        readiness.google.isConnected || readiness.meta.isConnected
          ? "Operable"
          : "Setup",
      detail:
        readiness.google.isConnected || readiness.meta.isConnected
          ? "connections persist locally"
          : "connect Google first",
      icon: Workflow
    },
    {
      label: "Data Mode",
      value: "Guided sample",
      detail: "live sync still pending",
      icon: Sparkles
    }
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-accent-foreground">
              Monday, May 11
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {heroTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {heroBody}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/connect">
                Connect Accounts
                <Cable className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/daily-stack">
                Open Stack
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase text-muted-foreground">
                    {stat.label}
                  </div>
                  <div className="mt-2 text-2xl font-black">{stat.value}</div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground">
                    {stat.detail}
                  </div>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <stat.icon className="h-5 w-5 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Next Best Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {setupTasks.map((task) => (
              <div key={task.title} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold">{task.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {task.reason}
                    </p>
                  </div>
                  <Badge variant={task.badgeVariant}>{task.badge}</Badge>
                </div>
                <Button asChild className="mt-4" size="sm" variant={task.ctaVariant}>
                  <Link href={task.href}>
                    {task.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/connect">Check integrations</Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/daily-stack">Run today's stack</Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/growth-chat">Ask Growth Chat</Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/weekly-report">Open weekly report</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function summarizeProvider(
  connected: boolean,
  credentialsReady: boolean,
  displayName: string | null
) {
  if (connected) {
    return {
      value: "Connected",
      detail: displayName ?? "account linked"
    };
  }

  if (credentialsReady) {
    return {
      value: "Ready",
      detail: "credentials saved, waiting for OAuth"
    };
  }

  return {
    value: "Setup",
    detail: "credentials missing"
  };
}

function buildHeroTitle(readiness: ReturnType<typeof getAppReadiness>) {
  if (!readiness.google.isConnected) {
    return "Connect Google first";
  }

  if (!readiness.aiReady) {
    return "Add your AI key to unlock the operator";
  }

  return "DreamGrowth is ready for operator work";
}

function buildHeroBody(readiness: ReturnType<typeof getAppReadiness>) {
  if (!readiness.google.isConnected) {
    return "Google is the highest-value first connection because it unlocks reviews, Google Business signals, search terms, and the strongest local-intent visibility inputs.";
  }

  if (!readiness.aiReady) {
    return "Your account connections are coming together. Add the AI key next so Daily Stack and Growth Chat can produce ranked actions instead of falling back to local defaults.";
  }

  return "The app is now protected, connections persist locally, and DreamGrowth can guide the owner through daily actions. The remaining gap is live data sync replacing guided sample cards.";
}

function buildSetupTasks(readiness: ReturnType<typeof getAppReadiness>) {
  const tasks: SetupTask[] = [];

  if (!readiness.google.isConnected) {
    tasks.push({
      title: "Connect Google",
      reason: readiness.googleCredentialsReady
        ? "The Google OAuth credentials are already saved. One connect flow will make the app remember the account locally."
        : "Google is still missing OAuth credentials, so the app cannot read reviews, ads, GA4, or Search Console yet.",
      badge: readiness.googleCredentialsReady ? "Highest value" : "Setup needed",
      badgeVariant: readiness.googleCredentialsReady ? "success" : "warning",
      href: "/connect",
      cta: readiness.googleCredentialsReady ? "Connect Google now" : "Open setup",
      ctaVariant: "default" as const
    });
  }

  if (!readiness.aiReady) {
    tasks.push({
      title: "Finish the AI setup",
      reason: `DreamGrowth is configured to use ${readiness.aiProvider}, but the API key is still missing.`,
      badge: "Blocking",
      badgeVariant: "warning" as const,
      href: "/settings",
      cta: "Open Admin Setup",
      ctaVariant: "outline" as const
    });
  }

  if (!readiness.meta.isConnected) {
    tasks.push({
      title: "Connect Meta when you are ready",
      reason: readiness.metaCredentialsReady
        ? "Meta is optional, but connecting it will make Facebook, Instagram, and lead workflows persistent too."
        : "Meta is optional for now. Save the app credentials later if you want social and lead workflows.",
      badge: "Optional",
      badgeVariant: "outline" as const,
      href: "/connect",
      cta: "Review Meta setup",
      ctaVariant: "outline" as const
    });
  }

  if (!readiness.appProtected) {
    tasks.push({
      title: "Lock the app before public deployment",
      reason: "The dev dashboard is still open if someone knows the URL. Set DREAMGROWTH_APP_PASSWORD before you publish it anywhere public.",
      badge: "Security",
      badgeVariant: "warning" as const,
      href: "/settings",
      cta: "Review setup notes",
      ctaVariant: "outline" as const
    });
  }

  if (tasks.length === 0) {
    tasks.push({
      title: "Run today's Daily Stack",
      reason: "The core setup is in place. Use Daily Stack to pressure-test the operator workflow and decide the next high-impact action.",
      badge: "Ready",
      badgeVariant: "success" as const,
      href: "/daily-stack",
      cta: "Open Daily Stack",
      ctaVariant: "default" as const
    });
  }

  return tasks.slice(0, 4);
}

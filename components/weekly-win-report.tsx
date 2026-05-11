import type * as React from "react";
import {
  CheckCircle2,
  Megaphone,
  MousePointerClick,
  Phone,
  Route,
  Store,
  Trophy,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWeeklyWinReport } from "@/lib/reports/weekly-win";
import type { WeeklyWinTrend } from "@/lib/reports/types";

const trendIcons: Record<
  WeeklyWinTrend["icon"],
  React.ComponentType<{ className?: string }>
> = {
  phone: Phone,
  route: Route,
  click: MousePointerClick,
  store: Store,
  users: Users,
  megaphone: Megaphone
};

export async function WeeklyWinReportView() {
  const report = await getWeeklyWinReport();
  const badgeVariant =
    report.mode === "partial_live"
      ? "success"
      : report.mode === "guided_connected"
        ? "outline"
        : "warning";
  const badgeLabel =
    report.mode === "partial_live"
      ? "Partial live sync"
      : report.mode === "guided_connected"
        ? "Connected foundation"
        : "Setup needed";

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold text-accent-foreground">
              Weekly Win Report
            </p>
            <h1 className="mt-2 max-w-4xl text-3xl font-black tracking-tight">
              {report.headline}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {report.weekStart} to {report.weekEnd}
            </p>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-muted-foreground">
              {report.note}
            </p>
          </div>
          <Badge variant={badgeVariant}>
            <Trophy className="mr-1 h-3 w-3" />
            {badgeLabel}
          </Badge>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {report.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className="text-xs font-bold uppercase text-muted-foreground">
                {metric.label}
              </div>
              <div className="mt-2 text-2xl font-black">{metric.value}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground">
                {metric.detail}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Completed Growth Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.completedTasks.map((task) => (
              <div key={task} className="flex items-start gap-3 rounded-md border border-border p-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
                <div className="text-sm font-semibold leading-6">{task}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{report.trendTitle}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.trends.map((trend) => (
              <Trend
                key={trend.label}
                icon={trendIcons[trend.icon]}
                label={trend.label}
                value={trend.value}
              />
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Trend({
  icon: Icon,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-accent-foreground" />
        {label}
      </div>
      <div className="text-lg font-black">{value}</div>
    </div>
  );
}

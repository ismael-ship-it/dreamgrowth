import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { GrowthTaskCard } from "@/components/growth-task-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardStats, growthTasks, quickActions } from "@/lib/mock-data";

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-accent-foreground">
              Monday, May 11
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              Today's Growth Stack
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Five AI-ranked actions to get more local calls, protect ad spend,
              earn reviews, and publish real work.
            </p>
          </div>
          <Button asChild>
            <Link href="/daily-stack">
              Open Stack
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/weekly-report">
              Weekly Report
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {dashboardStats.map((stat) => (
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
        <div className="space-y-3">
          {growthTasks.slice(0, 3).map((task, index) => (
            <GrowthTaskCard key={task.id} task={task} index={index} />
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                className="w-full justify-start"
                variant="outline"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

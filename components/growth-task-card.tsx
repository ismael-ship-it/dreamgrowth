import type * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Gauge,
  RefreshCw,
  Settings2,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { GrowthTask } from "@/lib/task-engine";

type GrowthTaskCardProps = {
  task: GrowthTask;
  index: number;
};

export function GrowthTaskCard({ task, index }: GrowthTaskCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold leading-tight text-foreground">
                {task.title}
              </h3>
              <Badge variant={statusBadgeVariant(task)}>{task.statusLabel}</Badge>
              <Badge variant={task.urgency === "High" ? "warning" : "secondary"}>
                {task.urgency}
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {task.reason}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
              {task.suggestedAction}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric icon={Gauge} label="Impact" value={`${task.impactScore}/100`} />
          <Metric icon={Clock3} label="Urgency" value={`${task.urgencyScore}/100`} />
          <Metric icon={ShieldCheck} label="Confidence" value={`${task.confidenceScore}%`} />
          <Metric label="Time" value={task.estimatedTime} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-md bg-muted px-2 py-1">Source: {task.source}</span>
          <span className="rounded-md bg-muted px-2 py-1">
            Workflow: {deliveryLabel(task.deliveryMode)}
          </span>
          <span className="rounded-md bg-muted px-2 py-1">
            {task.requiresApproval
              ? "Owner review required"
              : "No external action yet"}
          </span>
        </div>

        <div className="mt-4 rounded-lg border border-dashed border-border bg-background/70 p-3 text-sm font-semibold leading-6 text-muted-foreground">
          {task.disclaimer}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={task.actionHref}>
              <TaskActionIcon mode={task.deliveryMode} />
              {task.actionLabel}
            </Link>
          </Button>
          {task.secondaryActionHref && task.secondaryActionLabel ? (
            <Button asChild size="sm" variant="outline">
              <Link href={task.secondaryActionHref}>
                <ArrowRight className="h-4 w-4" />
                {task.secondaryActionLabel}
              </Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  icon: Icon,
  label,
  value
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-h-16 rounded-md border border-border bg-muted/45 p-3">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </div>
      <div className="mt-1 break-words text-sm font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

function TaskActionIcon({
  mode
}: {
  mode: GrowthTask["deliveryMode"];
}) {
  if (mode === "sync") {
    return <RefreshCw className="h-4 w-4" />;
  }

  if (mode === "setup") {
    return <Settings2 className="h-4 w-4" />;
  }

  return <ArrowRight className="h-4 w-4" />;
}

function statusBadgeVariant(task: GrowthTask) {
  if (task.deliveryMode === "setup" || task.deliveryMode === "sync") {
    return "warning" as const;
  }

  if (task.deliveryMode === "pending") {
    return "outline" as const;
  }

  return "success" as const;
}

function deliveryLabel(mode: GrowthTask["deliveryMode"]) {
  switch (mode) {
    case "manual":
      return "Manual owner step";
    case "sync":
      return "Sync before ranking";
    case "setup":
      return "Setup before live use";
    case "pending":
      return "Pending product lane";
  }
}

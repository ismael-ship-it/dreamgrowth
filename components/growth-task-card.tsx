import type * as React from "react";
import { Check, Clock3, Edit3, Gauge, SkipForward, ThumbsUp } from "lucide-react";
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
          <Metric label="Confidence" value={`${task.confidenceScore}%`} />
          <Metric label="Time" value={task.estimatedTime} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
          <span className="rounded-md bg-muted px-2 py-1">
            Source: {task.source}
          </span>
          <span className="rounded-md bg-muted px-2 py-1">
            Approval required
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button size="sm">
            <ThumbsUp className="h-4 w-4" />
            Approve
          </Button>
          <Button size="sm" variant="outline">
            <SkipForward className="h-4 w-4" />
            Skip
          </Button>
          <Button size="sm" variant="outline">
            <Edit3 className="h-4 w-4" />
            Edit
          </Button>
          <Button size="sm" variant="secondary">
            <Check className="h-4 w-4" />
            Complete
          </Button>
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

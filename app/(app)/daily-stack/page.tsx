import { GrowthTaskCard } from "@/components/growth-task-card";
import { generateDailyStackWithOpenAI } from "@/lib/ai/openai";
import {
  getGoogleConnection,
  getGoogleIntegrationSummary
} from "@/lib/google/service";
import { getMetaConnection, getMetaIntegrationSummary } from "@/lib/meta/service";

export default async function DailyStackPage() {
  const [google, meta, googleConnection, metaConnection] = await Promise.all([
    getGoogleIntegrationSummary(),
    getMetaIntegrationSummary(),
    Promise.resolve(getGoogleConnection()),
    Promise.resolve(getMetaConnection())
  ]);
  const result = await generateDailyStackWithOpenAI({
    google,
    meta,
    connection: {
      googleConnected: googleConnection.isConnected,
      metaConnected: metaConnection.isConnected
    },
    approvalRule: "DreamGrowth recommends. Owner approves before any external action."
  });

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <p className="text-sm font-bold text-accent-foreground">
          Today's Growth Stack
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          5 actions for more local growth
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Approve the highest-impact work first. DreamGrowth recommends, you
          approve, then the system executes.
        </p>
        <p className="mt-3 text-sm font-semibold text-muted-foreground">
          {result.note}
        </p>
      </section>
      <div className="space-y-3">
        {result.tasks.map((task, index) => (
          <GrowthTaskCard key={task.id} task={task} index={index} />
        ))}
      </div>
    </div>
  );
}

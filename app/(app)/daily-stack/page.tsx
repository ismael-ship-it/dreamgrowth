import { GrowthTaskCard } from "@/components/growth-task-card";
import { growthTasks } from "@/lib/mock-data";

export default function DailyStackPage() {
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
      </section>
      <div className="space-y-3">
        {growthTasks.map((task, index) => (
          <GrowthTaskCard key={task.id} task={task} index={index} />
        ))}
      </div>
    </div>
  );
}

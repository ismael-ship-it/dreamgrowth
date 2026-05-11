import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { moduleSummaries } from "@/lib/mock-data";

type ModulePageProps = {
  slug: keyof typeof moduleSummaries;
};

export function ModulePage({ slug }: ModulePageProps) {
  const module = moduleSummaries[slug];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <p className="text-sm font-bold text-accent-foreground">
          DreamGrowth Module
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          {module.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          {module.description}
        </p>
      </section>
      <div className="grid gap-3 md:grid-cols-3">
        {module.items.map((item) => (
          <Card key={item}>
            <CardContent className="flex items-start gap-3 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
              <div className="text-sm font-semibold leading-6">{item}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import type * as React from "react";
import { Camera, CheckCircle2, FileText, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { projectMediaLibrary } from "@/lib/content/mock-data";
import { generateDraftsForFirstProject } from "@/lib/content/generator";

export async function AiContentEngine() {
  const result = await generateDraftsForFirstProject();
  const selectedMedia = projectMediaLibrary[0];

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <p className="text-sm font-bold text-accent-foreground">
          AI Content Engine
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Turn real project photos into local posts
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          DreamGrowth uses uploaded project facts only: city, material, service,
          and notes. Every post starts as pending approval.
        </p>
        <Button asChild className="mt-4">
          <Link href="/media">Upload project photos</Link>
        </Button>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>Selected Project Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-border bg-muted">
              <div className="text-center">
                <Camera className="mx-auto h-10 w-10 text-accent-foreground" />
                <div className="mt-3 text-sm font-bold">
                  {selectedMedia.fileName}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Fact label="City" value={selectedMedia.city} />
              <Fact label="State" value={selectedMedia.state} />
              <Fact label="Material" value={selectedMedia.materialType} />
              <Fact label="Service" value={selectedMedia.serviceType} />
              <Fact label="Notes" value={selectedMedia.notes} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {result.drafts.map((draft) => (
            <Card key={draft.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="warning">Pending approval</Badge>
                  <Badge variant="outline">{draft.platform}</Badge>
                </div>
                <h3 className="mt-3 text-base font-bold">{draft.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {draft.body}
                </p>
                {draft.hashtags.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {draft.hashtags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                {draft.warnings.length ? (
                  <div className="mt-3 rounded-md bg-muted p-3 text-xs font-semibold text-muted-foreground">
                    {draft.warnings.join(" ")}
                  </div>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Rule icon={Sparkles} text="No generic AI phrases or fake project details." />
        <Rule icon={MapPin} text="City and material are used only when provided." />
        <Rule icon={FileText} text={result.approvalRule} />
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-3">
      <span className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-sm font-semibold">
        {value ?? "Not provided"}
      </span>
    </div>
  );
}

function Rule({
  icon: Icon,
  text
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
        <div className="text-sm font-semibold leading-6">{text}</div>
      </CardContent>
    </Card>
  );
}

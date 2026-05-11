import Link from "next/link";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  FileText,
  MapPin,
  Sparkles
} from "lucide-react";
import { getCompanyProfile } from "@/lib/company/profile";
import { getContentEngineSnapshot } from "@/lib/content/generator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function AiContentEngine() {
  const profile = getCompanyProfile();
  const snapshot = await getContentEngineSnapshot();
  const selectedMedia = snapshot.selectedMedia;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold text-accent-foreground">
              Content Operator
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Turn real project photos into local posts
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              DreamGrowth builds drafts from stored project facts only for{" "}
              {profile.companyName}. Upload photos, confirm the job facts, then
              review a Google Business draft before posting it manually.
            </p>
          </div>
          <Badge variant={selectedMedia ? "success" : "warning"}>
            {selectedMedia ? "Drafts ready to review" : "Needs uploaded photos"}
          </Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/media">Upload project photos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/google-business">Open Google Business</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <Card>
          <CardHeader>
            <CardTitle>Featured Media Record</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedMedia ? (
              <>
                <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-border bg-muted">
                  <div className="text-center">
                    <Camera className="mx-auto h-10 w-10 text-accent-foreground" />
                    <div className="mt-3 px-4 text-sm font-bold">
                      {selectedMedia.fileName}
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Fact label="City" value={selectedMedia.city} />
                  <Fact label="State" value={selectedMedia.state} />
                  <Fact label="Material" value={selectedMedia.materialType} />
                  <Fact label="Service" value={selectedMedia.serviceType} />
                  <Fact label="Project date" value={selectedMedia.projectDate} />
                  <Fact label="Notes" value={selectedMedia.notes} />
                </div>
                <div className="rounded-md bg-muted p-3 text-sm font-semibold leading-6 text-muted-foreground">
                  {snapshot.selectionReason}
                </div>
              </>
            ) : (
              <div className="rounded-md border border-dashed border-border p-4 text-sm font-semibold leading-6 text-muted-foreground">
                No uploaded media is available yet. Start in Media, save the first
                real project photo, and this page will use it for the first
                fact-based draft.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          {snapshot.result.drafts.length ? (
            snapshot.result.drafts.map((draft) => (
              <Card key={draft.id}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="warning">Owner review required</Badge>
                    <Badge variant="outline">{labelForPlatform(draft.platform)}</Badge>
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
                    <div className="mt-3 rounded-md bg-muted p-3 text-xs font-semibold leading-5 text-muted-foreground">
                      {draft.warnings.join(" ")}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link href="/google-business">
                        Review in Google workflow
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/growth-chat">Refine with Growth Chat</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-5">
                <div className="text-lg font-black">No fact-based drafts yet</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  DreamGrowth only drafts from saved project facts. Once at least
                  one real project photo is uploaded with city, service, and
                  material tags, this page will generate the first draft.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/media">Go to Media</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Operator Workflow</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {snapshot.workflow.map((step, index) => (
              <div
                key={step.id}
                className="rounded-lg border border-border bg-background/70 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black">
                    0{index + 1}. {step.title}
                  </div>
                  <Badge variant={badgeVariantForStep(step.status)}>
                    {labelForStepStatus(step.status)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guardrails</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Rule
              icon={Sparkles}
              text="No generic AI claims or invented project details."
            />
            <Rule
              icon={MapPin}
              text="City, material, and service only appear when they exist in the saved record."
            />
            <Rule icon={FileText} text={snapshot.manualPublishingNote} />
            <div className="rounded-md border border-dashed border-border p-3 text-xs font-semibold leading-5 text-muted-foreground">
              {snapshot.libraryDisclosure}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value ?? "Not provided"}</div>
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
    <div className="flex items-start gap-3 rounded-lg border border-border bg-background/70 p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
      <div className="text-sm font-semibold leading-6">{text}</div>
    </div>
  );
}

function labelForPlatform(platform: string) {
  return platform
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function badgeVariantForStep(status: "ready" | "attention" | "manual") {
  if (status === "ready") return "success" as const;
  if (status === "manual") return "outline" as const;
  return "warning" as const;
}

function labelForStepStatus(status: "ready" | "attention" | "manual") {
  if (status === "ready") return "Ready";
  if (status === "manual") return "Manual";
  return "Needs attention";
}

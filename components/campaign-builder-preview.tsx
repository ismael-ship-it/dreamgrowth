import type * as React from "react";
import {
  Ban,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  WalletCards
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  "Quartz countertops",
  "Granite countertops",
  "Countertop installation",
  "Fabrication"
];

const keywords = [
  '"quartz countertops near me"',
  '"countertop installer northborough"',
  "[granite countertop company]",
  "[countertop fabrication]"
];

const negatives = ["free", "diy", "jobs", "classes", "cheap samples"];

export function CampaignBuilderPreview() {
  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold text-accent-foreground">
              Future Module
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Google Ads Campaign Builder
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              DreamGrowth can draft local contractor campaigns, but every ad,
              keyword, location, and budget must be reviewed and approved before
              Google Ads is changed.
            </p>
          </div>
          <Badge variant="warning">Approval required</Badge>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Draft Workflow</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "AI creates campaign draft",
              "Owner reviews campaign",
              "Owner edits budget, keywords, ads, and locations",
              "Owner approves",
              "DreamGrowth publishes through Google Ads API"
            ].map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="text-sm font-semibold">{step}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protected Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Rule icon={ShieldCheck} text="All ad changes require approval" />
            <Rule icon={WalletCards} text="Never auto-increase budget" />
            <Rule icon={Ban} text="Broad match disabled by default" />
            <Rule icon={Ban} text="AI Max and expansion disabled by default" />
            <Rule icon={Phone} text="Calls and leads tracked from day one" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Example Campaign Draft</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-md border border-border bg-muted/45 p-4">
            <div className="text-xs font-bold uppercase text-muted-foreground">
              Goal
            </div>
            <div className="mt-2 text-lg font-black">Calls</div>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              Northborough + 18 miles
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/45 p-4">
            <div className="text-xs font-bold uppercase text-muted-foreground">
              Services
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {services.map((service) => (
                <Badge key={service} variant="outline">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/45 p-4">
            <div className="text-xs font-bold uppercase text-muted-foreground">
              Budget
            </div>
            <div className="mt-2 text-lg font-black">$65/day</div>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">
              Recommended from local service intent and call value.
            </p>
          </div>
          <div className="rounded-md border border-border bg-muted/45 p-4 lg:col-span-2">
            <div className="text-xs font-bold uppercase text-muted-foreground">
              Keyword Suggestions
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {keywords.map((keyword) => (
                <div key={keyword} className="text-sm font-semibold">
                  {keyword}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/45 p-4">
            <div className="text-xs font-bold uppercase text-muted-foreground">
              Starter Negatives
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {negatives.map((negative) => (
                <Badge key={negative} variant="warning">
                  {negative}
                </Badge>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <Button>
              <CheckCircle2 className="h-4 w-4" />
              Review Draft
            </Button>
          </div>
        </CardContent>
      </Card>
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
    <div className="flex items-start gap-3 rounded-md border border-border bg-muted/45 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
      <div className="text-sm font-semibold leading-5">{text}</div>
    </div>
  );
}

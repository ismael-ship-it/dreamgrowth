import type * as React from "react";
import {
  CalendarClock,
  CheckCircle2,
  Image,
  Mail,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { metaIntegrationSummary } from "@/lib/meta/mock-data";

export function MetaBusinessManager() {
  const {
    account,
    facebookPages,
    instagramAccounts,
    adAccounts,
    campaigns,
    leads,
    drafts,
    inboxReadiness
  } = metaIntegrationSummary;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold text-accent-foreground">
              Meta Business
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Facebook, Instagram, leads, and post approvals
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Meta is treated as a trust and lead follow-up layer. DreamGrowth
              drafts content and highlights leads, but publishing still requires
              owner approval.
            </p>
          </div>
          <Badge variant="success">{account.status}</Badge>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {facebookPages.map((page) => (
          <ConnectionCard
            key={page.id}
            icon={MessageCircle}
            title={page.name}
            label={page.category}
            value={`${page.followers.toLocaleString()} followers`}
          />
        ))}
        {instagramAccounts.map((account) => (
          <ConnectionCard
            key={account.id}
            icon={Image}
            title={`@${account.username}`}
            label="Instagram Business"
            value={`${account.followers.toLocaleString()} followers`}
          />
        ))}
        {adAccounts.map((adAccount) => (
          <ConnectionCard
            key={adAccount.id}
            icon={Megaphone}
            title={adAccount.name}
            label="Meta Ads"
            value={`$${adAccount.spend} spend / ${adAccount.leads} leads`}
          />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Lead Follow-Up</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="warning">{lead.status}</Badge>
                  <Badge variant="outline">{lead.source}</Badge>
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <UserRound className="mt-0.5 h-5 w-5 text-accent-foreground" />
                  <div>
                    <h3 className="text-sm font-bold">{lead.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {lead.serviceInterest}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-muted-foreground">
                      Waiting {lead.ageMinutes} minutes
                    </p>
                  </div>
                </div>
                <Button className="mt-4" size="sm">
                  <Mail className="h-4 w-4" />
                  Create Follow-Up Task
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Social Drafts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {drafts.map((draft) => (
              <div key={draft.id} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="warning">Pending approval</Badge>
                  <Badge variant="outline">{draft.target}</Badge>
                </div>
                <h3 className="mt-3 text-base font-bold">{draft.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {draft.body}
                </p>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  Source: {draft.sourcePhoto}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <CalendarClock className="h-4 w-4" />
                    Schedule
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Signals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="rounded-md border border-border p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold">{campaign.name}</h3>
                  <Badge variant="outline">{campaign.objective}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <MiniMetric label="Spend" value={`$${campaign.spend}`} />
                  <MiniMetric label="Leads" value={String(campaign.leads)} />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {campaign.note}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inbox Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Readiness
              label="Messenger"
              ready={inboxReadiness.messengerReady}
            />
            <Readiness
              label="Instagram DM"
              ready={inboxReadiness.instagramDmReady}
            />
            <Readiness
              label="Unified inbox model"
              ready={inboxReadiness.unifiedInboxPlanned}
            />
            <p className="text-sm leading-6 text-muted-foreground">
              {inboxReadiness.note}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ConnectionCard({
  icon: Icon,
  title,
  label,
  value
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
            <Icon className="h-5 w-5 text-accent-foreground" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold uppercase text-muted-foreground">
              {label}
            </div>
            <h3 className="mt-1 truncate text-sm font-bold">{title}</h3>
            <p className="mt-1 text-xs font-semibold text-muted-foreground">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="font-black">{value}</div>
    </div>
  );
}

function Readiness({ label, ready }: { label: string; ready: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border p-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        {ready ? (
          <ShieldCheck className="h-4 w-4 text-accent-foreground" />
        ) : (
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
        )}
        {label}
      </div>
      <Badge variant={ready ? "success" : "outline"}>
        {ready ? "Ready" : "Later"}
      </Badge>
    </div>
  );
}

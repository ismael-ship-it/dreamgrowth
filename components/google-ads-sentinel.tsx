import { Ban, CheckCircle2, CircleDollarSign, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GoogleIntegrationSummary } from "@/lib/google/types";
import type { IntegrationConnection } from "@/lib/integrations/store";

export function GoogleAdsSentinel({
  summary,
  connection
}: {
  summary: GoogleIntegrationSummary;
  connection: IntegrationConnection;
}) {
  const { wastedSpend, searchTerms, negativeKeywordSuggestions } = summary.googleAds;
  const googleBusinessLive = Boolean(connection.metadata.liveSync);
  const adsReady =
    connection.isConnected && connection.scopes.includes("https://www.googleapis.com/auth/adwords");

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <p className="text-sm font-bold text-accent-foreground">
          Google Ads Sentinel
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Stop wasted searches before they spend again
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          DreamGrowth reviews search terms, detects low-intent traffic, and
          drafts negative keywords. The owner approves before anything is
          applied in Google Ads.
        </p>
      </section>

      {!connection.isConnected ? (
        <EmptyState text="Connect Google first before DreamGrowth can read any Google Ads account context." />
      ) : !adsReady ? (
        <EmptyState text="The connected Google account was not authorized with Google Ads access yet." />
      ) : !searchTerms.length && !negativeKeywordSuggestions.length ? (
        <EmptyState
          text={
            googleBusinessLive
              ? "Google is connected, but Google Ads live sync is not wired yet. DreamGrowth should not guess wasted spend or negative keywords here."
              : "Run the first Google sync first. After that, Google Ads can be added as its own live sync layer."
          }
        />
      ) : null}

      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-bold uppercase text-muted-foreground">
              Flagged wasted spend
            </div>
            <div className="mt-2 text-3xl font-black">${wastedSpend}</div>
          </div>
          <Badge variant="warning">
            <ShieldAlert className="mr-1 h-3 w-3" />
            Approval required before changes
          </Badge>
        </CardContent>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Search Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {searchTerms.length ? (
              searchTerms.map((term) => (
                <div key={term.id} className="rounded-md border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-bold">{term.searchTerm}</h3>
                    <Badge
                      variant={term.decision === "keep" ? "success" : "warning"}
                    >
                      {term.decision}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {term.lowIntentReason}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <Metric label="Cost" value={`$${term.cost}`} />
                    <Metric label="Clicks" value={String(term.clicks)} />
                    <Metric label="Leads" value={String(term.conversions)} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyBody text="No live Google Ads search terms are available yet." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Negative Keyword Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {negativeKeywordSuggestions.length ? (
              negativeKeywordSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="rounded-md border border-border p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="warning">
                      <Ban className="mr-1 h-3 w-3" />
                      {suggestion.keyword}
                    </Badge>
                    <Badge variant="outline">{suggestion.matchType}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {suggestion.reason}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <Metric label="Waste" value={`$${suggestion.estimatedWaste}`} />
                    <Metric
                      label="Confidence"
                      value={`${suggestion.confidenceScore}%`}
                    />
                  </div>
                  <Button className="mt-4" size="sm">
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Negative
                  </Button>
                </div>
              ))
            ) : (
              <EmptyBody text="Negative keyword suggestions will appear only after Google Ads live sync is implemented." />
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <CircleDollarSign className="mt-0.5 h-5 w-5 shrink-0 text-accent-foreground" />
          <div className="text-sm font-semibold leading-6">
            DreamGrowth never auto-applies negatives, never increases budget,
            and never enables broad match, AI Max, or expansion by default.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-sm font-semibold leading-6 text-muted-foreground">
        {text}
      </CardContent>
    </Card>
  );
}

function EmptyBody({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-4 text-sm font-semibold leading-6 text-muted-foreground">
      {text}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="font-black">{value}</div>
    </div>
  );
}

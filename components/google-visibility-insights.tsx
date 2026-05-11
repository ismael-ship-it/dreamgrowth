import { BarChart3, SearchCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GoogleIntegrationSummary } from "@/lib/google/types";

export function GoogleVisibilityInsights({
  summary
}: {
  summary: GoogleIntegrationSummary;
}) {
  const { metrics: ga4Metrics } = summary.ga4;
  const { metrics: searchMetrics } = summary.searchConsole;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>GA4 Signals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ga4Metrics.length ? (
            ga4Metrics.map((metric) => (
              <div key={metric.source} className="rounded-md border border-border p-4">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <BarChart3 className="h-4 w-4 text-accent-foreground" />
                  {metric.source}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <SmallMetric label="Sessions" value={String(metric.sessions)} />
                  <SmallMetric
                    label="Leads"
                    value={String(metric.conversions)}
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {metric.note}
                </p>
              </div>
            ))
          ) : (
            <EmptyBody text="GA4 live sync is not wired yet, so DreamGrowth should not show traffic or conversion trends here." />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Console Opportunities</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {searchMetrics.length ? (
            searchMetrics.map((metric) => (
              <div key={metric.query} className="rounded-md border border-border p-4">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <SearchCheck className="h-4 w-4 text-accent-foreground" />
                  {metric.query}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <SmallMetric label="Clicks" value={String(metric.clicks)} />
                  <SmallMetric
                    label="Views"
                    value={String(metric.impressions)}
                  />
                  <SmallMetric
                    label="Position"
                    value={String(metric.position)}
                  />
                </div>
                <p className="mt-3 text-sm font-semibold leading-6">
                  {metric.action}
                </p>
              </div>
            ))
          ) : (
            <EmptyBody text="Search Console sync is not implemented yet, so no query opportunities should be claimed here." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyBody({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border p-4 text-sm font-semibold leading-6 text-muted-foreground">
      {text}
    </div>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted px-3 py-2">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="font-black">{value}</div>
    </div>
  );
}

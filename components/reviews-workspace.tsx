import Link from "next/link";
import { MessageSquareText, RefreshCw, Star } from "lucide-react";
import type { GoogleIntegrationSummary } from "@/lib/google/types";
import type { IntegrationConnection } from "@/lib/integrations/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GOOGLE_BUSINESS_SCOPE = "https://www.googleapis.com/auth/business.manage";

export function ReviewsWorkspace({
  summary,
  connection
}: {
  summary: GoogleIntegrationSummary;
  connection: IntegrationConnection;
}) {
  const reviews = summary.googleBusiness.reviews;
  const liveSync = Boolean(connection.metadata.liveSync);
  const hasScope = connection.scopes.includes(GOOGLE_BUSINESS_SCOPE);
  const averageRating = reviews.length
    ? (
        reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      ).toFixed(1)
    : null;
  const pendingDrafts = reviews.filter(
    (review) => review.responseStatus !== "published"
  ).length;
  const lowRatings = reviews.filter((review) => review.rating <= 3).length;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold text-accent-foreground">
              DreamGrowth Module
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Reviews</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
              Get more reviews, respond faster, and protect local trust with an
              owner-reviewed workflow powered by your live Google Business
              connection.
            </p>
          </div>
          <Badge variant={liveSync ? "success" : "outline"}>
            {liveSync ? "Live review sync ready" : "Waiting on first sync"}
          </Badge>
        </div>
      </section>

      {!connection.isConnected ? (
        <ActionCard
          title="Google is not connected yet"
          body="Connect the owner Google account first. Reviews only become available after that connection exists."
          href="/connect"
          cta="Connect Google"
        />
      ) : !hasScope ? (
        <ActionCard
          title="Google Business access is missing"
          body="The connected Google account is saved, but DreamGrowth still needs the Google Business scope to read reviews. Reconnect Google and approve the Business access request."
          href="/connect"
          cta="Reconnect Google"
        />
      ) : !liveSync ? (
        <ActionCard
          title="Run the first live sync"
          body="The account is connected, but no live Google Business review snapshot has been stored yet. Run the first sync to pull reviews into DreamGrowth."
          href="/google-business"
          cta="Open Google Business"
        />
      ) : !reviews.length ? (
        <ActionCard
          title="No reviews were returned yet"
          body="The live sync completed, but this workspace did not receive visible Google reviews yet. Check the connected locations or run another sync after new reviews land."
          href="/google-business"
          cta="Review Google sync"
        />
      ) : (
        <>
          <section className="grid gap-3 md:grid-cols-3">
            <MetricCard
              label="Reviews loaded"
              value={String(reviews.length)}
              note="From the live Google Business snapshot"
            />
            <MetricCard
              label="Average rating"
              value={averageRating ?? "-"}
              note="Based on currently visible reviews"
            />
            <MetricCard
              label="Drafts needing review"
              value={String(pendingDrafts)}
              note={
                lowRatings
                  ? `${lowRatings} low-rating review(s) deserve extra care`
                  : "No low-rating reviews in this snapshot"
              }
            />
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader>
                <CardTitle>Live review queue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-lg border border-border bg-background/70 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={review.rating >= 4 ? "success" : "warning"}>
                        <Star className="mr-1 h-3 w-3" />
                        {review.rating} stars
                      </Badge>
                      <Badge variant="outline">{review.reviewerName}</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                      {review.comment}
                    </p>
                    <div className="mt-4 rounded-md bg-muted p-3">
                      <div className="text-xs font-bold uppercase text-muted-foreground">
                        Draft response
                      </div>
                      <p className="mt-2 text-sm font-semibold leading-6">
                        {review.responseDraft}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link href="/growth-chat">
                          Refine in Growth Chat
                          <MessageSquareText className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href="/google-business">Return to Google workflow</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Next best move</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border bg-background/70 p-4 text-sm font-semibold leading-6">
                  Review the first response draft, tighten tone if needed, then
                  copy it into Google Business manually until direct publishing is
                  wired.
                </div>
                <div className="rounded-lg border border-dashed border-border p-4 text-xs font-semibold leading-5 text-muted-foreground">
                  DreamGrowth reads live reviews here, but posting the response
                  still happens manually in Google Business Profile.
                </div>
                <form action="/api/google/sync" method="post">
                  <Button type="submit" className="w-full">
                    <RefreshCw className="h-4 w-4" />
                    Run another Google sync
                  </Button>
                </form>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  note
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs font-bold uppercase text-muted-foreground">
          {label}
        </div>
        <div className="mt-2 text-2xl font-black">{value}</div>
        <div className="mt-1 text-xs font-semibold text-muted-foreground">
          {note}
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({
  title,
  body,
  href,
  cta
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="text-lg font-black">{title}</div>
        <p className="text-sm leading-6 text-muted-foreground">{body}</p>
        <Button asChild>
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

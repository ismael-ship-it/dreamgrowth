import type * as React from "react";
import { MessageSquareText, Phone, Route, Star, Store, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { googleIntegrationSummary } from "@/lib/google/mock-data";

export function GoogleBusinessManager() {
  const { metrics, reviews, postDrafts } = googleIntegrationSummary.googleBusiness;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-soft sm:p-6">
        <p className="text-sm font-bold text-accent-foreground">
          Google Business Profile
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          Turn local profile activity into action
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Reviews, calls, directions, profile views, photos, and post drafts are
          converted into owner-approved tasks.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold uppercase text-muted-foreground">
                    {metric.label}
                  </div>
                  <div className="mt-2 text-2xl font-black">{metric.value}</div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground">
                    {metric.trend}
                  </div>
                </div>
                <Store className="h-5 w-5 text-accent-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Review Response Drafts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="success">
                    <Star className="mr-1 h-3 w-3" />
                    {review.rating} stars
                  </Badge>
                  <Badge variant="warning">Approval required</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {review.comment}
                </p>
                <p className="mt-3 text-sm font-semibold leading-6">
                  {review.responseDraft}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm">
                    <MessageSquareText className="h-4 w-4" />
                    Approve Reply
                  </Button>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GBP Post Drafts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {postDrafts.map((post) => (
              <div key={post.id} className="rounded-md border border-border p-4">
                <Badge variant="warning">Pending approval</Badge>
                <h3 className="mt-3 text-base font-bold">{post.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {post.body}
                </p>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">
                  Source: {post.sourcePhoto}
                </p>
                <Button className="mt-4" size="sm">
                  Approve Post
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <Action icon={Upload} text="Fetch posts and photos when the API allows it." />
        <Action icon={Phone} text="Track calls, website clicks, profile views, and directions." />
        <Action icon={Route} text="Create owner-approved tasks from profile activity gaps." />
      </section>
    </div>
  );
}

function Action({
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

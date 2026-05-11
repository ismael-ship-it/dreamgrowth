import { ReviewsWorkspace } from "@/components/reviews-workspace";
import {
  getGoogleConnection,
  getGoogleIntegrationSummary
} from "@/lib/google/service";

export default async function ReviewsPage() {
  const [summary, connection] = await Promise.all([
    getGoogleIntegrationSummary(),
    Promise.resolve(getGoogleConnection())
  ]);

  return <ReviewsWorkspace summary={summary} connection={connection} />;
}

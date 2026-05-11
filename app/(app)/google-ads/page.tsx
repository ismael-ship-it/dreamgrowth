import { GoogleAdsSentinel } from "@/components/google-ads-sentinel";
import { GoogleVisibilityInsights } from "@/components/google-visibility-insights";
import {
  getGoogleConnection,
  getGoogleIntegrationSummary
} from "@/lib/google/service";

export default async function GoogleAdsPage() {
  const [summary, connection] = await Promise.all([
    getGoogleIntegrationSummary(),
    Promise.resolve(getGoogleConnection())
  ]);

  return (
    <div className="space-y-5">
      <GoogleAdsSentinel summary={summary} connection={connection} />
      <GoogleVisibilityInsights summary={summary} />
    </div>
  );
}

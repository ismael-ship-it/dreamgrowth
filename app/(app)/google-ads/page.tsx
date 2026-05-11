import { GoogleAdsSentinel } from "@/components/google-ads-sentinel";
import { GoogleVisibilityInsights } from "@/components/google-visibility-insights";

export default function GoogleAdsPage() {
  return (
    <div className="space-y-5">
      <GoogleAdsSentinel />
      <GoogleVisibilityInsights />
    </div>
  );
}

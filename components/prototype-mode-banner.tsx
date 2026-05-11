import { getAppReadiness } from "@/lib/app-readiness";

export function PrototypeModeBanner() {
  const readiness = getAppReadiness();
  const googleConnected = readiness.google.isConnected;
  const googleLiveSync = Boolean(readiness.google.metadata.liveSync);
  const toneClasses =
    googleLiveSync
      ? "border-sky-200/80 bg-sky-50 text-sky-950"
      : "border-amber-300/60 bg-amber-50 text-amber-950";
  const label = "Workspace focus:";

  let message =
    "DreamGrowth is intentionally narrowed to the Google Business Operator. Ads, Meta, content, calendar, media, and reporting stay out of the main navigation until the core Google loop is proven live.";

  if (googleLiveSync) {
    message =
      "Google Business accounts, locations, and reviews are syncing live. The workspace stays intentionally narrow while the team validates the first review-and-approval loop before reopening broader modules.";
  } else if (googleConnected) {
    message =
      "Google is connected, but the first live sync is still pending. Run it next so DreamGrowth can switch from setup mode to real Google Business actions.";
  }

  return (
    <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${toneClasses}`}>
      <span className="font-bold">{label}</span> {message}
    </div>
  );
}

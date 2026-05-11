import { getAppReadiness } from "@/lib/app-readiness";

export function PrototypeModeBanner() {
  const readiness = getAppReadiness();
  const googleLiveSync = Boolean(readiness.google.metadata.liveSync);
  const metaLiveSync = Boolean(readiness.meta.metadata.liveSync);

  let message =
    "DreamGrowth is still in operator beta. Connections persist locally, but reporting modules still lean on guided data until their dedicated live syncs are finished.";

  if (googleLiveSync || metaLiveSync) {
    const liveParts = [
      googleLiveSync ? "Google Business accounts, locations, and reviews" : null,
      metaLiveSync ? "Meta account structure, Pages, Instagram, and ad accounts" : null
    ].filter(Boolean);

    message = `${liveParts.join(
      "; "
    )} are now syncing live. Ads, GA4, Search Console, Meta leads, and some AI recommendations still run in guided mode until those sync layers are wired.`;
  }

  return (
    <div className="mb-5 rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <span className="font-bold">Operator beta:</span> {message}
    </div>
  );
}

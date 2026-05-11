import { getIntegrationConnection } from "@/lib/integrations/store";
import { getGoogleIntegrationSummary } from "@/lib/google/service";
import { getMetaIntegrationSummary } from "@/lib/meta/service";
import type { WeeklyWinReport } from "@/lib/reports/types";

export async function getWeeklyWinReport(): Promise<WeeklyWinReport> {
  const google = getIntegrationConnection("google");
  const meta = getIntegrationConnection("meta");
  const googleLiveSync = Boolean(google.metadata.liveSync);
  const metaLiveSync = Boolean(meta.metadata.liveSync);

  if (!google.isConnected && !meta.isConnected) {
    return {
      id: "weekly-win-setup-needed",
      mode: "setup_needed",
      note:
        "Weekly reporting stays empty until at least one marketing platform is connected.",
      weekStart: "Connect Google first",
      weekEnd: "Then add Meta if you use it",
      headline:
        "Connect Google or Meta to turn DreamGrowth into a real weekly win report instead of a mock dashboard.",
      moneySaved: 0,
      reviewsGained: 0,
      postsPublished: 0,
      photosUploaded: 0,
      visibilityImprovement: "0%",
      callsTrend: "Connect Google",
      directionsTrend: "Connect Google",
      websiteClicksTrend: "Connect GA4",
      completedTasks: [
        "Add Google OAuth credentials in Settings",
        "Connect your Google account",
        "Optionally connect Meta for Pages, Instagram, and leads"
      ],
      metrics: [
        {
          label: "Google",
          value: "Not connected",
          detail: "required for reviews, ads, GA4, and Search Console"
        },
        {
          label: "Meta",
          value: "Optional",
          detail: "connect if you use Facebook, Instagram, or Meta leads"
        },
        {
          label: "Weekly report",
          value: "Waiting",
          detail: "needs at least one connected platform"
        },
        {
          label: "Proof of value",
          value: "0",
          detail: "real wins start after connection"
        },
        {
          label: "Tasks completed",
          value: "0",
          detail: "operator workflow not started yet"
        },
        {
          label: "Data mode",
          value: "Setup",
          detail: "no live platform is connected"
        }
      ],
      trendTitle: "What unlocks next",
      trends: [
        {
          label: "Google",
          value: "Connect first",
          icon: "store"
        },
        {
          label: "Meta",
          value: "Optional",
          icon: "megaphone"
        },
        {
          label: "AI",
          value: "Then enable",
          icon: "click"
        }
      ]
    };
  }

  const connectedProviders = [google, meta]
    .filter((provider) => provider.isConnected)
    .map((provider) => provider.provider)
    .join(" + ");

  if (googleLiveSync || metaLiveSync) {
    const [googleSummary, metaSummary] = await Promise.all([
      google.isConnected ? getGoogleIntegrationSummary() : Promise.resolve(null),
      meta.isConnected ? getMetaIntegrationSummary() : Promise.resolve(null)
    ]);
    const googleLocations = readNumericMetadata(google.metadata.locationCount);
    const googleReviews = googleSummary?.googleBusiness.reviews.length ?? 0;
    const metaPages = metaSummary?.facebookPages.length ?? 0;
    const instagramAccounts = metaSummary?.instagramAccounts.length ?? 0;
    const metaAdAccounts = metaSummary?.adAccounts.length ?? 0;
    const syncedProviders = [
      googleLiveSync ? "Google Business" : null,
      metaLiveSync ? "Meta workspace" : null
    ]
      .filter(Boolean)
      .join(" + ");

    return {
      id: "weekly-win-live-foundation",
      mode: "partial_live",
      note: `Live sync foundation is active for ${syncedProviders}. The totals below are based on the live workspace footprint already captured, while Ads, GA4, Search Console, and Meta leads still need dedicated reporting syncs.`,
      weekStart: "2026-05-04",
      weekEnd: "2026-05-10",
      headline: `DreamGrowth is now holding ${googleLocations} Google locations, ${googleReviews} live Google reviews, and ${metaPages} Meta Pages inside the operator workspace.`,
      moneySaved: 0,
      reviewsGained: googleReviews,
      postsPublished: 0,
      photosUploaded: 0,
      visibilityImprovement: "Pending live reporting",
      callsTrend: "Pending GA4",
      directionsTrend: "Pending GBP insights",
      websiteClicksTrend: "Pending GA4",
      completedTasks: [
        googleLiveSync
          ? `Synced ${googleLocations} Google Business location${googleLocations === 1 ? "" : "s"} into DreamGrowth`
          : "Google live sync still pending",
        googleLiveSync
          ? `Imported ${googleReviews} live Google review${googleReviews === 1 ? "" : "s"} for operator follow-up`
          : "Google reviews will appear after the first sync",
        metaLiveSync
          ? `Mapped ${metaPages} Facebook Page${metaPages === 1 ? "" : "s"} and ${instagramAccounts} Instagram business account${instagramAccounts === 1 ? "" : "s"}`
          : "Meta Pages and Instagram accounts will appear after sync",
        metaLiveSync
          ? `Mapped ${metaAdAccounts} Meta ad account${metaAdAccounts === 1 ? "" : "s"} for future campaign reporting`
          : "Meta ad accounts will appear after sync"
      ],
      metrics: [
        {
          label: "Google locations",
          value: String(googleLocations),
          detail: googleLiveSync ? "live business listings cached locally" : "waiting on first live sync"
        },
        {
          label: "Reviews synced",
          value: String(googleReviews),
          detail: googleLiveSync ? "latest live Google reviews" : "Google reviews not synced yet"
        },
        {
          label: "Meta Pages",
          value: String(metaPages),
          detail: metaLiveSync ? "connected Pages in workspace" : "Meta page sync pending"
        },
        {
          label: "Instagram",
          value: String(instagramAccounts),
          detail: metaLiveSync ? "business accounts mapped" : "Instagram sync pending"
        },
        {
          label: "Ad accounts",
          value: String(metaAdAccounts),
          detail: metaLiveSync ? "live Meta ad account shell" : "Meta ads sync pending"
        },
        {
          label: "Data mode",
          value: "Partial live",
          detail: "workspace footprint is real; reporting layer still growing"
        }
      ],
      trendTitle: "Live Sync Footprint",
      trends: [
        {
          label: "Google locations",
          value: String(googleLocations),
          icon: "store"
        },
        {
          label: "Meta Pages",
          value: String(metaPages),
          icon: "users"
        },
        {
          label: "Ad accounts",
          value: String(metaAdAccounts),
          icon: "megaphone"
        }
      ]
    };
  }

  const moneySaved = 86;

  return {
    id: "weekly-win-2026-05-11",
    mode: "guided_connected",
    note: `Connected platforms: ${connectedProviders}. Connections persist locally, but DreamGrowth still avoids claiming weekly wins until the first live sync completes.`,
    weekStart: "2026-05-04",
    weekEnd: "2026-05-10",
    headline:
      "Your accounts are connected, but the first live sync still needs to run before DreamGrowth can report real weekly wins.",
    moneySaved: 0,
    reviewsGained: 0,
    postsPublished: 0,
    photosUploaded: 0,
    visibilityImprovement: "Pending first sync",
    callsTrend: "Pending first sync",
    directionsTrend: "Pending first sync",
    websiteClicksTrend: "Pending first sync",
    completedTasks: [
      "OAuth connection saved locally",
      "Workspace is ready for the first live sync",
      "Google Business will become the first trusted reporting lane after sync"
    ],
    metrics: [
      {
        label: "Connected platforms",
        value: connectedProviders,
        detail: "saved locally in DreamGrowth"
      },
      {
        label: "Weekly wins",
        value: "Pending",
        detail: "waiting on first live sync"
      },
      {
        label: "Google reviews",
        value: "Pending",
        detail: "will appear after Google Business sync"
      },
      {
        label: "Locations",
        value: "Pending",
        detail: "will appear after Google Business sync"
      },
      {
        label: "Reporting mode",
        value: "Connected",
        detail: "not yet live"
      },
      {
        label: "Next move",
        value: "Run sync",
        detail: "unlock the first trusted weekly report"
      }
    ],
    trendTitle: "What unlocks after sync",
    trends: [
      {
        label: "Google reviews",
        value: "Will load",
        icon: "store"
      },
      {
        label: "Locations",
        value: "Will load",
        icon: "route"
      },
      {
        label: "Real weekly wins",
        value: "Will unlock",
        icon: "click"
      }
    ]
  };
}

function readNumericMetadata(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

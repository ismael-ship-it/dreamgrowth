import { GoogleBusinessManager } from "@/components/google-business-manager";
import {
  getGoogleConnection,
  getGoogleIntegrationSummary
} from "@/lib/google/service";

export default async function GoogleBusinessPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [summary, connection] = await Promise.all([
    getGoogleIntegrationSummary(),
    Promise.resolve(getGoogleConnection())
  ]);

  return (
    <GoogleBusinessManager
      summary={summary}
      connection={connection}
      syncStatus={typeof params.sync === "string" ? (params.sync as "success" | "failed") : undefined}
      syncReason={typeof params.reason === "string" ? params.reason : undefined}
    />
  );
}

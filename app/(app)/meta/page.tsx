import { MetaBusinessManager } from "@/components/meta-business-manager";
import { getMetaConnection, getMetaIntegrationSummary } from "@/lib/meta/service";

export default async function MetaPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [summary, connection] = await Promise.all([
    getMetaIntegrationSummary(),
    Promise.resolve(getMetaConnection())
  ]);

  return (
    <MetaBusinessManager
      summary={summary}
      connection={connection}
      syncStatus={typeof params.sync === "string" ? (params.sync as "success" | "failed") : undefined}
    />
  );
}

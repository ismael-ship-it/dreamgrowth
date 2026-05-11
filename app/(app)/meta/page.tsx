import { MetaBusinessManager } from "@/components/meta-business-manager";
import { getMetaConnection, getMetaIntegrationSummary } from "@/lib/meta/service";

export default async function MetaPage() {
  const [summary, connection] = await Promise.all([
    getMetaIntegrationSummary(),
    Promise.resolve(getMetaConnection())
  ]);

  return <MetaBusinessManager summary={summary} connection={connection} />;
}

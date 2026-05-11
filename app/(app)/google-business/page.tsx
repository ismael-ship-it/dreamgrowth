import { GoogleBusinessManager } from "@/components/google-business-manager";
import {
  getGoogleConnection,
  getGoogleIntegrationSummary
} from "@/lib/google/service";

export default async function GoogleBusinessPage() {
  const [summary, connection] = await Promise.all([
    getGoogleIntegrationSummary(),
    Promise.resolve(getGoogleConnection())
  ]);

  return <GoogleBusinessManager summary={summary} connection={connection} />;
}

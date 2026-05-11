import { IntegrationsSettings } from "@/components/integrations-settings";

export default async function ConnectPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <IntegrationsSettings
      statusQueries={{
        google:
          typeof params.google === "string" ? params.google : undefined,
        meta: typeof params.meta === "string" ? params.meta : undefined
      }}
    />
  );
}

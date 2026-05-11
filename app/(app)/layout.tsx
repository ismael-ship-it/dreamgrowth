import { AppShell } from "@/components/app-shell";
import { PrototypeModeBanner } from "@/components/prototype-mode-banner";
import { requireAppSession } from "@/lib/auth";

export default async function ProductLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireAppSession();

  return (
    <AppShell>
      <PrototypeModeBanner />
      {children}
    </AppShell>
  );
}

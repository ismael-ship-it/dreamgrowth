import { AppShell } from "@/components/app-shell";
import { requireAppSession } from "@/lib/auth";

export default async function ProductLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireAppSession();

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}

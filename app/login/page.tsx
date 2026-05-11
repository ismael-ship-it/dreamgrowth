import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";
import { isAppProtectionEnabled } from "@/lib/auth";
import { getCompanyProfile } from "@/lib/company/profile";

export default function LoginPage() {
  if (!isAppProtectionEnabled()) {
    redirect("/dashboard");
  }

  const profile = getCompanyProfile();

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row lg:items-start">
        <section className="max-w-2xl space-y-4 lg:pt-10">
          <p className="text-sm font-bold text-accent-foreground">
            DreamGrowth Owner Access
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Lock the app, then run growth from one place
          </h1>
          <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
            DreamGrowth is an internal operator for {profile.companyName}. Use the owner password
            to open the dashboard, configure integrations, and work through daily growth actions.
          </p>
          <div className="rounded-lg border border-border bg-card p-4 text-sm font-semibold leading-6 text-muted-foreground">
            Tip: set <code>DREAMGROWTH_APP_PASSWORD</code> and <code>DREAMGROWTH_SESSION_SECRET</code> in your environment
            before deploying publicly.
          </div>
        </section>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Unlock DreamGrowth</CardTitle>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

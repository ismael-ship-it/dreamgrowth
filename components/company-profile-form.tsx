"use client";

import { useState } from "react";
import { Building2, Loader2, Save } from "lucide-react";
import type { CompanyProfile } from "@/lib/company/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FormState = {
  companyName: string;
  website: string;
  phone: string;
  email: string;
  primaryCity: string;
  primaryState: string;
  showroom: string;
  fabricationShop: string;
  industry: string;
  tone: string;
  services: string;
  serviceAreas: string;
  callsToAction: string;
  rules: string;
};

export function CompanyProfileForm({
  initialProfile
}: {
  initialProfile: CompanyProfile;
}) {
  const [form, setForm] = useState<FormState>(toFormState(initialProfile));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/company/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: form.companyName,
        website: form.website,
        phone: form.phone,
        email: form.email,
        primaryCity: form.primaryCity,
        primaryState: form.primaryState,
        showroom: form.showroom,
        fabricationShop: form.fabricationShop,
        industry: form.industry,
        tone: form.tone,
        services: parseLines(form.services),
        serviceAreas: parseLines(form.serviceAreas),
        callsToAction: parseLines(form.callsToAction),
        rules: parseLines(form.rules)
      })
    });
    const data = (await response.json()) as {
      message?: string;
      error?: string;
      profile?: CompanyProfile;
    };

    if (data.profile) {
      setForm(toFormState(data.profile));
    }

    setMessage(data.message ?? data.error ?? "Saved.");
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-accent-foreground" />
          Company Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-md bg-muted p-3 text-sm font-semibold leading-6 text-muted-foreground">
          This profile powers the AI operator voice, content drafts, local city
          prompts, and workflow defaults across DreamGrowth.
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field label="Company name" value={form.companyName} onChange={(value) => setForm((current) => ({ ...current, companyName: value }))} />
          <Field label="Industry" value={form.industry} onChange={(value) => setForm((current) => ({ ...current, industry: value }))} />
          <Field label="Website" value={form.website} onChange={(value) => setForm((current) => ({ ...current, website: value }))} />
          <Field label="Phone" value={form.phone} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
          <Field label="Email" value={form.email} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />
          <Field label="Primary city" value={form.primaryCity} onChange={(value) => setForm((current) => ({ ...current, primaryCity: value }))} />
          <Field label="Primary state" value={form.primaryState} onChange={(value) => setForm((current) => ({ ...current, primaryState: value }))} />
          <Field label="Tone" value={form.tone} onChange={(value) => setForm((current) => ({ ...current, tone: value }))} />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <TextArea
            label="Showroom"
            value={form.showroom}
            onChange={(value) => setForm((current) => ({ ...current, showroom: value }))}
            rows={3}
          />
          <TextArea
            label="Fabrication shop"
            value={form.fabricationShop}
            onChange={(value) =>
              setForm((current) => ({ ...current, fabricationShop: value }))
            }
            rows={3}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <TextArea
            label="Services"
            value={form.services}
            onChange={(value) => setForm((current) => ({ ...current, services: value }))}
            help="One service per line"
          />
          <TextArea
            label="Service areas"
            value={form.serviceAreas}
            onChange={(value) =>
              setForm((current) => ({ ...current, serviceAreas: value }))
            }
            help="One city or area per line"
          />
          <TextArea
            label="Calls to action"
            value={form.callsToAction}
            onChange={(value) =>
              setForm((current) => ({ ...current, callsToAction: value }))
            }
            help="One CTA per line"
          />
          <TextArea
            label="AI rules"
            value={form.rules}
            onChange={(value) => setForm((current) => ({ ...current, rules: value }))}
            help="One rule per line"
          />
        </div>

        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Company Profile
        </Button>

        {message ? (
          <div className="rounded-md bg-muted p-3 text-sm font-semibold">
            {message}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function toFormState(profile: CompanyProfile): FormState {
  return {
    companyName: profile.companyName,
    website: profile.website,
    phone: profile.phone,
    email: profile.email,
    primaryCity: profile.primaryCity,
    primaryState: profile.primaryState,
    showroom: profile.showroom,
    fabricationShop: profile.fabricationShop,
    industry: profile.industry,
    tone: profile.tone,
    services: profile.services.join("\n"),
    serviceAreas: profile.serviceAreas.join("\n"),
    callsToAction: profile.callsToAction.join("\n"),
    rules: profile.rules.join("\n")
  };
}

function parseLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  help,
  rows = 6
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      {help ? (
        <span className="mt-1 block text-xs font-semibold text-muted-foreground">
          {help}
        </span>
      ) : null}
    </label>
  );
}

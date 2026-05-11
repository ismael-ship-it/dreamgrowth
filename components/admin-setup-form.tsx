"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, EyeOff, Loader2, Save, Settings2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type EnvKey =
  | "OPENAI_API_KEY"
  | "OPENAI_MODEL"
  | "AI_PROVIDER"
  | "GEMINI_API_KEY"
  | "GEMINI_MODEL"
  | "GOOGLE_CLIENT_ID"
  | "GOOGLE_CLIENT_SECRET"
  | "GOOGLE_REDIRECT_URI"
  | "GOOGLE_ADS_DEVELOPER_TOKEN"
  | "GOOGLE_ADS_LOGIN_CUSTOMER_ID"
  | "META_APP_ID"
  | "META_APP_SECRET"
  | "META_REDIRECT_URI";

type EnvStatus = Record<EnvKey, { configured: boolean; preview: string }>;
type FormState = Partial<Record<EnvKey, string>>;

const sections: Array<{
  title: string;
  description: string;
  fields: Array<{ key: EnvKey; label: string; placeholder: string; secret?: boolean }>;
}> = [
  {
    title: "Google",
    description: "Required for Google Business Profile, Ads, GA4, and Search Console.",
    fields: [
      {
        key: "GOOGLE_CLIENT_ID",
        label: "Google Client ID",
        placeholder: "Paste Google OAuth Client ID"
      },
      {
        key: "GOOGLE_CLIENT_SECRET",
        label: "Google Client Secret",
        placeholder: "Paste Google OAuth Client Secret",
        secret: true
      },
      {
        key: "GOOGLE_REDIRECT_URI",
        label: "Google Redirect URL",
        placeholder: "http://localhost:3000/api/oauth/google/callback"
      },
      {
        key: "GOOGLE_ADS_DEVELOPER_TOKEN",
        label: "Google Ads Developer Token",
        placeholder: "Optional at first",
        secret: true
      },
      {
        key: "GOOGLE_ADS_LOGIN_CUSTOMER_ID",
        label: "Google Ads Login Customer ID",
        placeholder: "Optional at first"
      }
    ]
  },
  {
    title: "AI Provider",
    description: "Use Gemini if you already have Google AI credits. OpenAI stays optional.",
    fields: [
      {
        key: "AI_PROVIDER",
        label: "AI Provider",
        placeholder: "gemini"
      },
      {
        key: "GEMINI_API_KEY",
        label: "Gemini API Key",
        placeholder: "Paste Gemini API Key",
        secret: true
      },
      {
        key: "GEMINI_MODEL",
        label: "Gemini Model",
        placeholder: "gemini-2.5-flash"
      },
      {
        key: "OPENAI_API_KEY",
        label: "OpenAI API Key",
        placeholder: "Optional fallback",
        secret: true
      },
      {
        key: "OPENAI_MODEL",
        label: "OpenAI Model",
        placeholder: "gpt-4o"
      }
    ]
  },
  {
    title: "Meta",
    description: "Use after Google is working: Facebook, Instagram, Meta Ads, leads.",
    fields: [
      {
        key: "META_APP_ID",
        label: "Meta App ID",
        placeholder: "Paste Meta App ID"
      },
      {
        key: "META_APP_SECRET",
        label: "Meta App Secret",
        placeholder: "Paste Meta App Secret",
        secret: true
      },
      {
        key: "META_REDIRECT_URI",
        label: "Meta Redirect URL",
        placeholder: "http://localhost:3000/api/oauth/meta/callback"
      }
    ]
  }
];

export function AdminSetupForm() {
  const [status, setStatus] = useState<EnvStatus | null>(null);
  const [form, setForm] = useState<FormState>({
    GOOGLE_REDIRECT_URI: "http://localhost:3000/api/oauth/google/callback",
    META_REDIRECT_URI: "http://localhost:3000/api/oauth/meta/callback",
    AI_PROVIDER: "gemini",
    GEMINI_MODEL: "gemini-2.5-flash",
    OPENAI_MODEL: "gpt-4o"
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus() {
    const response = await fetch("/api/admin/env");
    const data = (await response.json()) as { status: EnvStatus };
    setStatus(data.status);
  }

  async function save() {
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/env", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = (await response.json()) as {
      status?: EnvStatus;
      message?: string;
      error?: string;
    };

    if (data.status) {
      setStatus(data.status);
    }

    setMessage(data.message ?? data.error ?? "Saved.");
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-accent-foreground" />
          Admin Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-md bg-muted p-3 text-sm font-semibold leading-6 text-muted-foreground">
          Paste credentials here once. DreamGrowth saves them locally for this
          development app, so you do not need to edit code or env files by hand.
        </div>

        {sections.map((section) => (
          <div key={section.title} className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold">{section.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {section.description}
                </p>
              </div>
              <Badge variant={sectionReady(section.fields, status) ? "success" : "warning"}>
                {sectionReady(section.fields, status) ? "Configured" : "Needs setup"}
              </Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {section.fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                    {field.label}
                    {status?.[field.key]?.configured ? (
                      <span className="inline-flex items-center gap-1 normal-case text-accent-foreground">
                        <CheckCircle2 className="h-3 w-3" />
                        {status[field.key].preview}
                      </span>
                    ) : null}
                  </span>
                  <div className="relative mt-2">
                    <input
                      type={field.secret ? "password" : "text"}
                      value={form[field.key] ?? ""}
                      placeholder={field.placeholder}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          [field.key]: event.target.value
                        }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                    {field.secret ? (
                      <EyeOff className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    ) : null}
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}

        <Button onClick={save} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Setup
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

function sectionReady(
  fields: Array<{ key: EnvKey }>,
  status: EnvStatus | null
) {
  if (!status) return false;
  return fields.every((field) => {
    if (
      field.key === "GOOGLE_ADS_DEVELOPER_TOKEN" ||
      field.key === "GOOGLE_ADS_LOGIN_CUSTOMER_ID"
    ) {
      return true;
    }

    return status[field.key]?.configured;
  });
}

"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const data = (await response.json()) as { error?: string; redirectTo?: string };

      if (!response.ok) {
        setError(data.error ?? "Could not unlock DreamGrowth.");
        setLoading(false);
        return;
      }

      window.location.href = data.redirectTo ?? "/dashboard";
    } catch {
      setError("Could not unlock DreamGrowth right now.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-bold uppercase text-muted-foreground">
          Owner Password
        </span>
        <div className="relative mt-2">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter the DreamGrowth owner password"
            className="h-11 w-full rounded-md border border-input bg-background px-3 pr-10 text-sm outline-none focus:ring-2 focus:ring-ring"
            required
          />
          <LockKeyhole className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
        </div>
      </label>

      {error ? (
        <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm font-semibold text-destructive">
          {error}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
        Unlock DreamGrowth
      </Button>
    </form>
  );
}

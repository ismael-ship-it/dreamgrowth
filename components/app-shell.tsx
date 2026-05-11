"use client";

import type * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cable,
  Home,
  MessageCircle,
  Search,
  Settings,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "Mission Control",
    shortLabel: "Mission",
    description: "Track the 3-step Google launch flow",
    icon: Home
  },
  {
    href: "/connect",
    label: "Connect Google",
    shortLabel: "Connect",
    description: "Link the owner Google account",
    icon: Cable
  },
  {
    href: "/google-business",
    label: "Google Business",
    shortLabel: "Google",
    description: "Run syncs and review the first actions",
    icon: Store
  },
  {
    href: "/settings",
    label: "Settings",
    shortLabel: "Settings",
    description: "Admin controls and app access",
    icon: Settings
  }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-border bg-card lg:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-border p-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Search className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-black tracking-tight">
                  DreamGrowth
                </div>
                <div className="text-xs font-semibold text-muted-foreground">
                  Google Business Operator
                </div>
              </div>
            </Link>
          </div>
          <nav className="flex-1 space-y-2 p-3">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Current workspace
            </div>
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (pathname === "/" && item.href === "/dashboard");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-start gap-3 rounded-md px-3 py-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  <item.icon className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div
                      className={cn(
                        "mt-1 text-xs leading-5 text-muted-foreground",
                        active && "text-primary-foreground/80"
                      )}
                    >
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-4">
            <div className="rounded-lg border border-dashed border-border bg-muted/60 p-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <MessageCircle className="h-4 w-4 text-accent-foreground" />
                Navigation trimmed on purpose
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Google Business is the only primary operator lane right now.
                Ads, Meta, content, calendar, and reports stay out of the main
                navigation until the first live loop is stable.
              </p>
            </div>
            <Link
              href="/api/auth/logout"
              className="mt-3 inline-flex text-xs font-bold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              Lock app
            </Link>
          </div>
        </div>
      </aside>
      <main className="pb-24 lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (pathname === "/" && item.href === "/dashboard");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[11px] font-semibold text-muted-foreground",
                active && "bg-primary text-primary-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="max-w-full truncate">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

"use client";

import type * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Cable,
  GalleryHorizontalEnd,
  Home,
  Images,
  MessagesSquare,
  Megaphone,
  MessageCircle,
  Newspaper,
  Search,
  Settings,
  Star,
  Store,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/growth-chat", label: "Growth Chat", icon: MessagesSquare },
  { href: "/daily-stack", label: "Daily Stack", icon: ClipboardCheck },
  { href: "/connect", label: "Connect", icon: Cable },
  { href: "/google-business", label: "Google Business", icon: Store },
  { href: "/google-ads", label: "Google Ads", icon: Target },
  { href: "/campaign-builder", label: "Campaign Builder", icon: BarChart3 },
  { href: "/meta", label: "Meta", icon: Megaphone },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/media", label: "Media", icon: Images },
  { href: "/content", label: "Content", icon: GalleryHorizontalEnd },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/weekly-report", label: "Weekly Report", icon: Newspaper },
  { href: "/settings", label: "Settings", icon: Settings }
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
                  AI Growth Operator
                </div>
              </div>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (pathname === "/" && item.href === "/dashboard");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    active && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <MessageCircle className="h-4 w-4 text-accent-foreground" />
                Today's focus
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Save ad waste, answer reviews, and publish one real project.
              </p>
            </div>
          </div>
        </div>
      </aside>
      <main className="pb-24 lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-card/95 px-2 py-2 backdrop-blur lg:hidden">
        {navItems.slice(0, 5).map((item) => {
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
              <span className="max-w-full truncate">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

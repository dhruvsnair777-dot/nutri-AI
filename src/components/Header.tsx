"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, Quote } from "lucide-react";
import { NAV_ITEMS } from "@/components/Sidebar";
import { useApp } from "@/context/AppContext";
import { getGreeting } from "@/lib/utils";

const QUOTES = [
  "🌿 Small steps, big results.",
  "💪 Consistency beats intensity.",
  "🥗 Fuel your body, feed your goals.",
  "💧 Hydrate first, snack later.",
  "🎯 Progress, not perfection.",
  "🍎 Eat the rainbow every day.",
];

export default function Header({ onOpenMobile }: { onOpenMobile: () => void }) {
  const pathname = usePathname();
  const { profile } = useApp();
  const [quote, setQuote] = useState(QUOTES[0]);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    setGreeting(getGreeting());
  }, []);

  const active =
    NAV_ITEMS.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? NAV_ITEMS[0];

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobile}
            className="rounded-lg border border-border bg-card p-2 text-muted hover:text-foreground lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <nav className="flex items-center gap-1 text-xs text-muted">
              <span>Workspace</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-foreground">{active.label}</span>
            </nav>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {greeting}, {profile?.name ?? "there"} 👋
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 md:flex">
          <Quote className="h-3.5 w-3.5 text-brand" />
          <span className="text-xs text-muted">{quote}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-foreground">
              {profile?.name ?? "Guest"}
            </p>
            <p className="text-[11px] text-muted">Member</p>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-dark">
            {(profile?.name ?? "?")
              .split(" ")
              .map((p) => p.charAt(0))
              .join("")
              .slice(0, 2)
              .toUpperCase() || "?"}
          </span>
        </div>
      </div>
    </header>
  );
}

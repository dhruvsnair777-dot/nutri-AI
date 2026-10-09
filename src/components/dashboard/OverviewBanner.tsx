"use client";

import { CalendarDays, Quote, Sparkles } from "lucide-react";
import { getGreeting, toDateKey } from "@/lib/utils";

interface OverviewBannerProps {
  name: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  days: { value: string; label: string }[];
  caloriesTarget: number;
}

export default function OverviewBanner({
  name,
  selectedDate,
  onDateChange,
  days,
  caloriesTarget,
}: OverviewBannerProps) {
  return (
    <section className="animate-fade-in overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand to-brand-dark p-5 text-white sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-white/80">
            <Sparkles className="h-3.5 w-3.5" /> Your daily overview
          </p>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl">
            {getGreeting()}, {name} 👋
          </h1>
          <p className="mt-1 max-w-md text-sm text-white/85">
            🌿 Small steps, big results. You&apos;re targeting{" "}
            <strong>{caloriesTarget.toLocaleString()} kcal</strong> today — let&apos;s
            make it count.
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 rounded-xl bg-white/15 px-3 py-2 backdrop-blur">
          <CalendarDays className="h-4 w-4" />
          <select
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="cursor-pointer bg-transparent text-sm font-medium text-white outline-none [&>option]:text-foreground"
            aria-label="Select date"
          >
            {days.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
        <Quote className="h-3.5 w-3.5 shrink-0 text-white/80" />
        <p className="text-xs text-white/90">
          &ldquo;The food you eat can be either the safest and most powerful
          form of medicine or the slowest form of poison.&rdquo;
        </p>
      </div>
    </section>
  );
}

/** Build the date-dropdown options: last 6 days plus today. */
export function buildDateOptions(): { value: string; label: string }[] {
  const today = new Date();
  const options: { value: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const value = toDateKey(d);
    const label =
      i === 0
        ? "Today"
        : i === 1
          ? "Yesterday"
          : d.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
    options.push({ value, label });
  }
  return options;
}

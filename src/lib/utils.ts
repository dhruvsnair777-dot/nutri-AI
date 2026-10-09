import type { DailyLog, DailyTotals, LoggedFood } from "./types";
import { safeNumber, safeRound } from "./nutrition";

/** Tiny classNames joiner. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format a Date (or date string) as YYYY-MM-DD in local time. */
export function toDateKey(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return toDateKey(new Date());
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatLongDate(key: string): string {
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(key: string): string {
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function getGreeting(date: Date = new Date()): string {
  const h = date.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/** Aggregate the totals of a list of logged foods. */
export function sumFoods(foods: LoggedFood[]): DailyTotals {
  return foods.reduce<DailyTotals>(
    (acc, f) => ({
      calories: acc.calories + safeNumber(f.calories),
      protein: acc.protein + safeNumber(f.protein),
      carbs: acc.carbs + safeNumber(f.carbs),
      fat: acc.fat + safeNumber(f.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function emptyLog(date: string): DailyLog {
  return { date, water: 0, foods: [] };
}

/** Ensure every numeric field is rounded for display. */
export function roundedTotals(foods: LoggedFood[]): DailyTotals {
  const t = sumFoods(foods);
  return {
    calories: safeRound(t.calories),
    protein: safeRound(t.protein),
    carbs: safeRound(t.carbs),
    fat: safeRound(t.fat),
  };
}

export function formatNumber(n: unknown): string {
  return safeRound(n).toLocaleString("en-US");
}

export function createId(prefix = "id"): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

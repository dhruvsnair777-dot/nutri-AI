"use client";

import { useMemo } from "react";
import { Award, Droplets, Flame, TrendingUp } from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { DailyLog } from "@/lib/types";
import { Card, CardHeader, EmptyState } from "@/components/ui";
import { addDays, cn, formatNumber, roundedTotals, toDateKey } from "@/lib/utils";

export default function ProgressPage() {
  const { targets, dailyLogs } = useApp();

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i - 6);
      const key = toDateKey(d);
      const log: DailyLog = dailyLogs[key] ?? { date: key, water: 0, foods: [] };
      const totals = roundedTotals(log.foods);
      return {
        key,
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        dateLabel: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        totals,
        water: log.water,
      };
    });
  }, [dailyLogs]);

  if (!targets) return null;

  const loggedDays = days.filter((d) => d.totals.calories > 0);
  const avgCalories = loggedDays.length
    ? Math.round(
        loggedDays.reduce((s, d) => s + d.totals.calories, 0) /
          loggedDays.length,
      )
    : 0;
  const avgWater = Math.round(
    days.reduce((s, d) => s + d.water, 0) / days.length,
  );
  const totalMeals = days.reduce((s, d) => s + d.totals.calories, 0);
  const maxCalories = Math.max(
    targets.calories,
    ...days.map((d) => d.totals.calories),
    1,
  );

  const avgProtein = loggedDays.length
    ? Math.round(
        loggedDays.reduce((s, d) => s + d.totals.protein, 0) /
          loggedDays.length,
      )
    : 0;
  const avgCarbs = loggedDays.length
    ? Math.round(
        loggedDays.reduce((s, d) => s + d.totals.carbs, 0) / loggedDays.length,
      )
    : 0;
  const avgFat = loggedDays.length
    ? Math.round(
        loggedDays.reduce((s, d) => s + d.totals.fat, 0) / loggedDays.length,
      )
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-lg font-bold">Progress</h1>
        <p className="mt-0.5 text-sm text-muted">
          A rolling view of your last 7 days.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Flame className="h-4 w-4" />}
          label="Avg. calories / day"
          value={formatNumber(avgCalories)}
          sub={`Target ${formatNumber(targets.calories)} kcal`}
          tone="brand"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Total logged this week"
          value={formatNumber(totalMeals)}
          sub={`${loggedDays.length} active day${loggedDays.length === 1 ? "" : "s"}`}
          tone="accent"
        />
        <StatCard
          icon={<Droplets className="h-4 w-4" />}
          label="Avg. water / day"
          value={`${avgWater}`}
          sub="glasses (goal 8)"
          tone="accent"
        />
        <StatCard
          icon={<Award className="h-4 w-4" />}
          label="Goal adherence"
          value={`${loggedDays.length ? Math.round((avgCalories / targets.calories) * 100) : 0}%`}
          sub="of calorie target"
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Calories — last 7 days"
            subtitle="Bars show logged intake; dashed line is your target"
            icon={<Flame className="h-4 w-4" />}
          />
          <div className="mt-6 flex h-52 items-end justify-between gap-2 sm:gap-4">
            {days.map((d) => {
              const heightPct = Math.min(
                100,
                (d.totals.calories / maxCalories) * 100,
              );
              const targetPct = Math.min(100, (targets.calories / maxCalories) * 100);
              const over = d.totals.calories > targets.calories;
              return (
                <div
                  key={d.key}
                  className="flex flex-1 flex-col items-center justify-end gap-1.5"
                >
                  <span className="text-[10px] font-medium text-muted">
                    {d.totals.calories > 0 ? formatNumber(d.totals.calories) : ""}
                  </span>
                  <div className="relative flex h-36 w-full items-end justify-center">
                    <div
                      className={cn(
                        "w-full max-w-[38px] rounded-t-lg transition-all duration-500",
                        over ? "bg-danger/70" : "bg-brand/80",
                      )}
                      style={{ height: `${Math.max(heightPct, d.totals.calories > 0 ? 4 : 0)}%` }}
                      title={`${formatNumber(d.totals.calories)} kcal`}
                    />
                    <div
                      className="pointer-events-none absolute left-0 right-0 border-t border-dashed border-foreground/30"
                      style={{ bottom: `${targetPct}%` }}
                      aria-hidden
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[11px] font-semibold">{d.label}</p>
                    <p className="text-[9px] text-muted">{d.dateLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Average macros"
            subtitle="Across days with logged food"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          {loggedDays.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="No data yet"
                description="Log some foods to see your macro averages."
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <MacroRow label="Protein" avg={avgProtein} target={targets.protein} tone="bg-accent" />
              <MacroRow label="Carbohydrates" avg={avgCarbs} target={targets.carbs} tone="bg-warning" />
              <MacroRow label="Fat" avg={avgFat} target={targets.fat} tone="bg-violet-500" />
            </div>
          )}

          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs font-medium text-muted">Water — last 7 days</p>
            <div className="mt-3 flex items-end justify-between gap-1">
              {days.map((d) => (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-16 w-full items-end justify-center">
                    <div
                      className="w-full max-w-[20px] rounded-t bg-accent/70"
                      style={{ height: `${Math.min(100, (d.water / 8) * 100)}%` }}
                      title={`${d.water} glasses`}
                    />
                  </div>
                  <span className="text-[10px] text-muted">{d.label[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: "brand" | "accent" | "warning";
}) {
  const tones = {
    brand: "bg-brand-soft text-brand-dark",
    accent: "bg-accent/10 text-accent",
    warning: "bg-warning/10 text-warning",
  };
  return (
    <Card>
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          tones[tone],
        )}
      >
        {icon}
      </span>
      <p className="mt-3 text-xl font-bold">{value}</p>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-0.5 text-[11px] text-muted">{sub}</p>
    </Card>
  );
}

function MacroRow({
  label,
  avg,
  target,
  tone,
}: {
  label: string;
  avg: number;
  target: number;
  tone: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted">
          {avg}g avg / {Math.round(target)}g
        </span>
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className={cn("h-full rounded-full transition-all duration-500", tone)}
          style={{ width: `${Math.min(100, (avg / (target || 1)) * 100)}%` }}
        />
      </div>
    </div>
  );
}

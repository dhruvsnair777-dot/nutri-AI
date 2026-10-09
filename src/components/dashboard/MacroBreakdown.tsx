"use client";

import { BarChart3 } from "lucide-react";
import type { DailyTotals, MacroNutrients } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui";
import { macroPercentages, percentOf } from "@/lib/nutrition";

interface MacroBreakdownProps {
  totals: DailyTotals;
  targets: MacroNutrients;
}

export default function MacroBreakdown({ totals, targets }: MacroBreakdownProps) {
  const split = macroPercentages(targets);

  const rows = [
    {
      label: "Protein",
      current: totals.protein,
      target: targets.protein,
      split: split.protein,
      bar: "bg-accent",
      text: "text-accent",
    },
    {
      label: "Carbohydrates",
      current: totals.carbs,
      target: targets.carbs,
      split: split.carbs,
      bar: "bg-warning",
      text: "text-warning",
    },
    {
      label: "Fat",
      current: totals.fat,
      target: targets.fat,
      split: split.fat,
      bar: "bg-violet-500",
      text: "text-violet-500",
    },
  ];

  return (
    <Card className="animate-fade-in">
      <CardHeader
        title="Macro breakdown"
        subtitle="Consumed vs. goal, with recommended split"
        icon={<BarChart3 className="h-4 w-4" />}
      />

      <div className="mt-4 space-y-4">
        {rows.map((row) => {
          const pct = percentOf(row.current, row.target);
          const width = Math.min(100, pct);
          return (
            <div key={row.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{row.label}</span>
                <span className="text-muted">
                  <span className={row.text}>{Math.round(row.current)}g</span> /{" "}
                  {Math.round(row.target)}g · target {row.split}%
                </span>
              </div>
              <div className="relative mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className={`h-full rounded-full ${row.bar} transition-all duration-500`}
                  style={{ width: `${width}%` }}
                />
                <div
                  className="absolute top-0 h-full w-px bg-foreground/30"
                  style={{ left: `${Math.min(100, row.split)}%` }}
                  title={`Recommended ${row.split}%`}
                  aria-hidden
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] text-muted">
        The vertical marker shows your recommended macro split based on your
        goal.
      </p>
    </Card>
  );
}

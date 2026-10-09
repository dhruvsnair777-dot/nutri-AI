"use client";

import { Beef, Droplet, Wheat } from "lucide-react";
import type { DailyTotals, MacroNutrients } from "@/lib/types";
import { Card, ProgressBar } from "@/components/ui";
import { percentOf } from "@/lib/nutrition";

interface MacrosGridProps {
  totals: DailyTotals;
  targets: MacroNutrients;
}

export default function MacrosGrid({ totals, targets }: MacrosGridProps) {
  const items = [
    {
      key: "protein" as const,
      label: "Protein",
      icon: Beef,
      current: totals.protein,
      target: targets.protein,
      color: "accent" as const,
      bar: "bg-accent",
    },
    {
      key: "carbs" as const,
      label: "Carbohydrates",
      icon: Wheat,
      current: totals.carbs,
      target: targets.carbs,
      color: "warning" as const,
      bar: "bg-warning",
    },
    {
      key: "fat" as const,
      label: "Healthy fats",
      icon: Droplet,
      current: totals.fat,
      target: targets.fat,
      color: "violet" as const,
      bar: "bg-violet-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        const pct = percentOf(item.current, item.target);
        return (
          <Card
            key={item.key}
            className="animate-fade-in"
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  item.key === "protein"
                    ? "bg-accent/10 text-accent"
                    : item.key === "carbs"
                      ? "bg-warning/10 text-warning"
                      : "bg-violet-500/10 text-violet-500"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-muted">{pct}%</span>
            </div>
            <p className="mt-3 text-xs font-medium text-muted">{item.label}</p>
            <p className="mt-0.5 text-xl font-bold">
              {Math.round(item.current)}
              <span className="ml-1 text-sm font-medium text-muted">
                / {Math.round(item.target)} g
              </span>
            </p>
            <div className="mt-3">
              <ProgressBar value={item.current} max={item.target} color={item.color} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

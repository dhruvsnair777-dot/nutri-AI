"use client";

import Link from "next/link";
import { Flame, TrendingDown, TrendingUp } from "lucide-react";
import type { DailyTotals, NutritionTargets } from "@/lib/types";
import { Button, Card, CardHeader, ProgressBar } from "@/components/ui";
import { formatNumber } from "@/lib/utils";

interface CaloriesCardProps {
  totals: DailyTotals;
  targets: NutritionTargets;
}

export default function CaloriesCard({ totals, targets }: CaloriesCardProps) {
  const eaten = Math.max(0, Math.round(totals.calories));
  const target = Math.max(0, Math.round(targets.calories));
  const remaining = target - eaten;
  const over = remaining < 0;

  return (
    <Card className="animate-fade-in">
      <CardHeader
        title="Calories eaten"
        subtitle="Today's intake vs. your target"
        icon={<Flame className="h-4 w-4" />}
        action={
          <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-medium text-brand-dark">
            {target > 0 ? Math.round((eaten / target) * 100) : 0}%
          </span>
        }
      />

      <div className="mt-5 flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold tracking-tight">
            {formatNumber(eaten)}
            <span className="ml-1 text-base font-medium text-muted">
              / {formatNumber(target)} kcal
            </span>
          </p>
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${
            over ? "text-danger" : "text-brand"
          }`}
        >
          {over ? (
            <>
              <TrendingUp className="h-3.5 w-3.5" /> {formatNumber(-remaining)} over
            </>
          ) : (
            <>
              <TrendingDown className="h-3.5 w-3.5" /> {formatNumber(remaining)} left
            </>
          )}
        </span>
      </div>

      <div className="mt-4">
        <ProgressBar
          value={eaten}
          max={target}
          color={over ? "danger" : "brand"}
          height="h-3"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
        <MiniStat label="BMR" value={`${formatNumber(targets.bmr)}`} />
        <MiniStat label="TDEE" value={`${formatNumber(targets.tdee)}`} />
        <MiniStat label="Target" value={`${formatNumber(target)}`} />
      </div>

      <Link href="/food-search" className="mt-4 block">
        <Button variant="secondary" className="w-full">
          Log food
        </Button>
      </Link>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold">{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, UtensilsCrossed } from "lucide-react";
import type { MealPlan } from "@/lib/types";
import { Button, Card, CardHeader, EmptyState } from "@/components/ui";
import { formatNumber } from "@/lib/utils";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};

export default function MealPlanPreviewCard({
  mealPlan,
  date,
}: {
  mealPlan: MealPlan | null;
  date: string;
}) {
  // Try to match the selected date, else fall back to the first day.
  const day =
    mealPlan?.days.find((d) => d.date === date) ?? mealPlan?.days[0] ?? null;

  return (
    <Card className="animate-fade-in">
      <CardHeader
        title="Today's meal plan"
        subtitle={day ? `${day.day} · ${formatNumber(day.totalCalories)} kcal` : "No plan generated yet"}
        icon={<UtensilsCrossed className="h-4 w-4" />}
        action={
          <Link
            href="/meal-plan"
            className="flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark"
          >
            View full plan <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      {!day ? (
        <div className="mt-4">
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title="Generate your AI meal plan"
            description="Get a personalized 7-day plan built around your goals and restrictions."
            action={
              <Link href="/meal-plan">
                <Button size="sm">
                  <Sparkles className="h-4 w-4" /> Generate plan
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {day.meals.slice(0, 4).map((meal) => (
            <li
              key={`${day.date}-${meal.type}-${meal.name}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                  {MEAL_LABELS[meal.type] ?? meal.type}
                </p>
                <p className="truncate text-sm font-medium">{meal.name}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold">
                  {formatNumber(meal.calories)}
                </p>
                <p className="text-[11px] text-muted">kcal</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

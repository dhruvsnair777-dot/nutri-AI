"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ChefHat,
  Coffee,
  Moon,
  RefreshCw,
  Sandwich,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { MealPlan, MealType } from "@/lib/types";
import { Badge, Button, Card, EmptyState, Skeleton } from "@/components/ui";
import { cn, formatNumber, formatShortDate } from "@/lib/utils";

const MEAL_META: Record<
  MealType,
  { label: string; icon: typeof Coffee }
> = {
  breakfast: { label: "Breakfast", icon: Coffee },
  lunch: { label: "Lunch", icon: Sandwich },
  dinner: { label: "Dinner", icon: Moon },
  snacks: { label: "Snacks", icon: UtensilsCrossed },
};

export default function MealPlanPage() {
  const { profile, targets, mealPlan, saveMealPlan, clearMealPlan } = useApp();
  const [selectedDay, setSelectedDay] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"ai" | "fallback" | null>(null);

  async function generate() {
    if (!profile || !targets) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, targets }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = (await res.json()) as {
        plan?: MealPlan;
        source?: "ai" | "fallback";
      };
      if (!data.plan || !Array.isArray(data.plan.days)) {
        throw new Error("Invalid plan returned");
      }
      saveMealPlan(data.plan);
      setSource(data.source ?? "fallback");
      setSelectedDay(0);
    } catch {
      setError(
        "We couldn't generate a plan right now. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!profile || !targets) return null;

  const day = mealPlan?.days[selectedDay] ?? mealPlan?.days[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold">AI Meal Plan</h1>
          <p className="mt-0.5 text-sm text-muted">
            {targets.calories} kcal/day · {targets.protein}g protein ·{" "}
            {targets.carbs}g carbs · {targets.fat}g fat
          </p>
        </div>
        <div className="flex items-center gap-2">
          {mealPlan ? (
            <Button
              variant="secondary"
              onClick={() => {
                clearMealPlan();
                setSource(null);
              }}
              disabled={loading}
            >
              Clear
            </Button>
          ) : null}
          <Button onClick={() => void generate()} disabled={loading}>
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            {mealPlan ? "Regenerate plan" : "Generate 7-day plan"}
          </Button>
        </div>
      </div>

      {source ? (
        <div className="flex items-center gap-2">
          <Badge tone={source === "ai" ? "brand" : "warning"}>
            <Sparkles className="h-3 w-3" />
            {source === "ai"
              ? "AI-generated"
              : "Sample plan (AI unavailable)"}
          </Badge>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      ) : null}

      {loading ? (
        <PlanSkeleton />
      ) : !mealPlan ? (
        <EmptyState
          icon={<ChefHat className="h-7 w-7" />}
          title="No meal plan yet"
          description="Generate a personalized 7-day plan built around your calorie target, macros and dietary restrictions."
          action={
            <Button onClick={() => void generate()}>
              <Sparkles className="h-4 w-4" /> Generate plan
            </Button>
          }
        />
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {mealPlan.days.map((d, i) => (
              <button
                key={d.date}
                type="button"
                onClick={() => setSelectedDay(i)}
                className={cn(
                  "shrink-0 rounded-xl border px-3.5 py-2 text-left transition-colors",
                  i === selectedDay
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-card text-foreground hover:border-brand/40",
                )}
              >
                <p className="text-xs font-semibold">{d.day}</p>
                <p
                  className={cn(
                    "text-[11px]",
                    i === selectedDay ? "text-white/80" : "text-muted",
                  )}
                >
                  {formatShortDate(d.date)}
                </p>
              </button>
            ))}
          </div>

          {day ? (
            <div className="animate-fade-in space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
                <p className="text-sm font-semibold">{day.day}&apos;s meals</p>
                <p className="text-sm text-muted">
                  Total:{" "}
                  <span className="font-semibold text-foreground">
                    {formatNumber(day.totalCalories)} kcal
                  </span>
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {day.meals.map((meal, index) => {
                  const meta = MEAL_META[meal.type] ?? MEAL_META.snacks;
                  const Icon = meta.icon;
                  return (
                    <Card key={`${day.date}-${meal.type}-${index}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-dark">
                            <Icon className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
                              {meta.label}
                            </p>
                            <h3 className="text-sm font-semibold">{meal.name}</h3>
                          </div>
                        </div>
                        <span className="shrink-0 text-sm font-bold">
                          {formatNumber(meal.calories)}
                          <span className="ml-0.5 text-xs font-normal text-muted">
                            kcal
                          </span>
                        </span>
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-muted">
                        {meal.description}
                      </p>

                      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
                        <MacroPill label="Protein" value={`${meal.protein}g`} tone="text-accent" />
                        <MacroPill label="Carbs" value={`${meal.carbs}g`} tone="text-warning" />
                        <MacroPill label="Fat" value={`${meal.fat}g`} tone="text-violet-500" />
                      </div>

                      {meal.ingredients.length > 0 ? (
                        <div className="mt-3">
                          <p className="text-[11px] font-medium text-muted">
                            Ingredients
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {meal.ingredients.map((ing) => (
                              <span
                                key={ing}
                                className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[11px] text-muted"
                              >
                                {ing}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function MacroPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div>
      <p className={cn("text-sm font-semibold", tone)}>{value}</p>
      <p className="text-[11px] text-muted">{label}</p>
    </div>
  );
}

function PlanSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-20" />
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
}

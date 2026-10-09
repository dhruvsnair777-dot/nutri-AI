"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Utensils,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { FOOD_CATEGORIES, FOOD_DATABASE } from "@/lib/foods";
import type { FoodItem, MealType } from "@/lib/types";
import { Button, Card, CardHeader, EmptyState, ProgressBar } from "@/components/ui";
import { cn, formatNumber, roundedTotals, toDateKey } from "@/lib/utils";

const MEAL_OPTIONS: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snacks", label: "Snacks" },
];

function defaultMeal(): MealType {
  const h = new Date().getHours();
  if (h < 11) return "breakfast";
  if (h < 15) return "lunch";
  if (h < 20) return "dinner";
  return "snacks";
}

export default function FoodSearchPage() {
  const { targets, getLog, logFood, removeFood, clearDay } = useApp();
  const today = toDateKey();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [selections, setSelections] = useState<
    Record<string, { qty: number; meal: MealType }>
  >({});

  const log = getLog(today);
  const totals = roundedTotals(log.foods);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FOOD_DATABASE.filter((f) => {
      const matchesCategory = category === "All" || f.category === category;
      const matchesQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  function getSelection(food: FoodItem) {
    return (
      selections[food.id] ?? { qty: 1, meal: defaultMeal() }
    );
  }

  function setSelection(
    food: FoodItem,
    patch: Partial<{ qty: number; meal: MealType }>,
  ) {
    setSelections((prev) => ({
      ...prev,
      [food.id]: { ...getSelection(food), ...patch },
    }));
  }

  function handleAdd(food: FoodItem) {
    const sel = getSelection(food);
    logFood(food, sel.qty, sel.meal, today);
  }

  if (!targets) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div>
        <h1 className="text-lg font-bold">Food Search & Logging</h1>
        <p className="mt-0.5 text-sm text-muted">
          Search foods and log them — your dashboard updates instantly.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Search + results */}
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a food (e.g. chicken, oats, avocado)…"
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-10 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {["All", ...FOOD_CATEGORIES].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    category === c
                      ? "bg-brand text-white"
                      : "bg-black/[0.05] text-muted hover:text-foreground",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </Card>

          <div className="space-y-2">
            {results.length === 0 ? (
              <EmptyState
                icon={<Search className="h-6 w-6" />}
                title="No foods found"
                description="Try a different search term or category."
              />
            ) : (
              results.map((food) => {
                const sel = getSelection(food);
                return (
                  <Card key={food.id} className="animate-fade-in">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">
                            {food.name}
                          </p>
                          <span className="shrink-0 rounded-full bg-black/[0.05] px-2 py-0.5 text-[10px] text-muted">
                            {food.category}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted">
                          {food.serving} · {food.calories} kcal · P{" "}
                          {food.protein}g · C {food.carbs}g · F {food.fat}g
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-xl border border-border bg-background">
                          <button
                            type="button"
                            className="px-2.5 py-1.5 text-muted hover:text-foreground"
                            onClick={() =>
                              setSelection(food, {
                                qty: Math.max(0.5, sel.qty - 0.5),
                              })
                            }
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-9 text-center text-sm font-medium">
                            {sel.qty}
                          </span>
                          <button
                            type="button"
                            className="px-2.5 py-1.5 text-muted hover:text-foreground"
                            onClick={() =>
                              setSelection(food, { qty: sel.qty + 0.5 })
                            }
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <select
                          value={sel.meal}
                          onChange={(e) =>
                            setSelection(food, {
                              meal: e.target.value as MealType,
                            })
                          }
                          className="rounded-xl border border-border bg-background px-2 py-2 text-xs outline-none focus:border-brand"
                          aria-label="Meal type"
                        >
                          {MEAL_OPTIONS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>

                        <Button size="sm" onClick={() => handleAdd(food)}>
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Today's log */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Today's log"
              subtitle={new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
              icon={<Utensils className="h-4 w-4" />}
              action={
                log.foods.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => clearDay(today)}
                    className="text-xs font-medium text-danger hover:opacity-80"
                  >
                    Clear all
                  </button>
                ) : null
              }
            />

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Calories</span>
                <span className="text-muted">
                  {formatNumber(totals.calories)} /{" "}
                  {formatNumber(targets.calories)}
                </span>
              </div>
              <ProgressBar value={totals.calories} max={targets.calories} />
              <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                <MiniMacro label="Protein" value={totals.protein} target={targets.protein} tone="text-accent" />
                <MiniMacro label="Carbs" value={totals.carbs} target={targets.carbs} tone="text-warning" />
                <MiniMacro label="Fat" value={totals.fat} target={targets.fat} tone="text-violet-500" />
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {log.foods.length === 0 ? (
                <p className="py-6 text-center text-xs text-muted">
                  Nothing logged yet today. Search on the left to add foods.
                </p>
              ) : (
                log.foods.map((entry) => (
                  <div
                    key={entry.logId}
                    className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">
                        {entry.name}
                      </p>
                      <p className="text-[11px] text-muted">
                        {entry.quantity}× · {entry.mealType} ·{" "}
                        {formatNumber(entry.calories)} kcal
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFood(entry.logId, today)}
                      className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger"
                      aria-label={`Remove ${entry.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniMacro({
  label,
  value,
  target,
  tone,
}: {
  label: string;
  value: number;
  target: number;
  tone: string;
}) {
  return (
    <div className="rounded-lg bg-background py-2">
      <p className={cn("text-sm font-semibold", tone)}>{Math.round(value)}g</p>
      <p className="text-[10px] text-muted">
        {label} / {Math.round(target)}g
      </p>
    </div>
  );
}

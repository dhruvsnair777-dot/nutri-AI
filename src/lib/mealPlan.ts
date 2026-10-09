import type { MealPlan, MealType, NutritionTargets, UserProfile } from "./types";
import { addDays, createId, toDateKey } from "./utils";
import { safeRound } from "./nutrition";
import { buildMockMealPlan } from "./mockPlan";

export const MEAL_TYPES: MealType[] = [
  "breakfast",
  "lunch",
  "dinner",
  "snacks",
];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/** Extract the first JSON object from an LLM response, tolerating fences. */
export function extractJson(text: string): unknown {
  if (!text || typeof text !== "string") {
    throw new Error("Empty LLM response");
  }
  let cleaned = text.trim();

  // Strip markdown code fences if present.
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch && fenceMatch[1]) {
    cleaned = fenceMatch[1].trim();
  }

  // Fall back to slicing from the first brace to the last.
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned) as unknown;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asMealType(value: unknown, index: number): MealType {
  const v = asString(value).toLowerCase();
  if ((MEAL_TYPES as string[]).includes(v)) return v as MealType;
  return MEAL_TYPES[index % MEAL_TYPES.length];
}

/**
 * Validate and normalize arbitrary parsed JSON into a strict MealPlan.
 * Throws if the result is unusable so callers can fall back safely.
 */
export function normalizeMealPlan(
  raw: unknown,
  _targets: NutritionTargets,
): MealPlan {
  const root = (raw ?? {}) as Record<string, unknown>;
  const rawDays = asArray(root.days);
  if (rawDays.length === 0) throw new Error("No days in plan");

  const start = new Date();
  const days = rawDays.slice(0, 7).map((rawDay, dayIndex) => {
    const dayObj = (rawDay ?? {}) as Record<string, unknown>;
    const rawMeals = asArray(dayObj.meals);
    const date = addDays(start, dayIndex);

    const meals = rawMeals.slice(0, 6).map((rawMeal, mealIndex) => {
      const m = (rawMeal ?? {}) as Record<string, unknown>;
      const ingredients = asArray(m.ingredients)
        .map((i) => asString(i))
        .filter(Boolean);
      return {
        type: asMealType(m.type, mealIndex),
        name: asString(m.name, `Meal ${mealIndex + 1}`),
        description: asString(m.description, "A balanced, nutritious option."),
        calories: safeRound(m.calories),
        protein: safeRound(m.protein),
        carbs: safeRound(m.carbs),
        fat: safeRound(m.fat),
        ingredients: ingredients.length ? ingredients : ["See description"],
      };
    });

    if (meals.length === 0) throw new Error("Day has no meals");

    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    return {
      day: asString(dayObj.day, DAY_NAMES[date.getDay()]),
      date: toDateKey(date),
      totalCalories,
      meals,
    };
  });

  return {
    id: createId("plan"),
    generatedAt: new Date().toISOString(),
    days,
  };
}

/** Validate shape without throwing — used by API tests / guards. */
export function looksLikeMealPlan(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const days = (raw as Record<string, unknown>).days;
  return Array.isArray(days) && days.length > 0;
}

/** System prompt instructing the model to return strict JSON. */
export function buildMealPlanPrompt(
  profile: UserProfile,
  targets: NutritionTargets,
): string {
  const restrictions =
    profile.restrictions.length > 0
      ? profile.restrictions.join(", ")
      : "none";
  return `You are a certified nutritionist AI. Create a 7-day meal plan.

USER PROFILE
- Name: ${profile.name || "User"}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Weight: ${profile.weight} kg
- Height: ${profile.height} cm
- Activity level: ${profile.activityLevel}
- Goal: ${profile.goal}
- Dietary restrictions: ${restrictions}
- Daily target: ${targets.calories} kcal | ${targets.protein}g protein | ${targets.carbs}g carbs | ${targets.fat}g fat

REQUIREMENTS
- 7 days, each with breakfast, lunch, dinner and snacks.
- Respect ALL dietary restrictions strictly.
- Each meal must include realistic calories, protein (g), carbs (g), fat (g) and a list of ingredients.
- Keep each day's total close to the daily target of ${targets.calories} kcal.

Respond with ONLY minified JSON (no markdown, no commentary) matching exactly:
{"days":[{"day":"Monday","meals":[{"type":"breakfast","name":"string","description":"string","calories":0,"protein":0,"carbs":0,"fat":0,"ingredients":["string"]}]}]}`;
}

/** Always-safe fallback used whenever the LLM is missing or returns junk. */
export function safeFallbackPlan(
  profile: UserProfile,
  targets: NutritionTargets,
): MealPlan {
  return buildMockMealPlan(profile, targets);
}

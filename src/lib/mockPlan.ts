import type { MealPlan, MealType, NutritionTargets, UserProfile } from "./types";
import { addDays, createId, toDateKey } from "./utils";
import { safeRound } from "./nutrition";

interface MealTemplate {
  name: string;
  description: string;
  ingredients: string[];
  /** Fraction of the daily calories this meal should carry. */
  share: number;
}

const BREAKFASTS: MealTemplate[] = [
  { name: "Greek Yogurt Berry Bowl", description: "Creamy yogurt with oats, chia and fresh berries.", ingredients: ["Greek yogurt", "Rolled oats", "Blueberries", "Chia seeds", "Honey"], share: 0.25 },
  { name: "Veggie Tofu Scramble", description: "Turmeric tofu scramble with spinach and peppers.", ingredients: ["Firm tofu", "Spinach", "Bell pepper", "Olive oil", "Whole wheat toast"], share: 0.25 },
  { name: "Oatmeal & Peanut Butter", description: "Warm oats topped with banana and peanut butter.", ingredients: ["Rolled oats", "Banana", "Peanut butter", "Almond milk", "Cinnamon"], share: 0.25 },
];

const LUNCHES: MealTemplate[] = [
  { name: "Grilled Chicken & Quinoa", description: "Lean chicken over quinoa with roasted vegetables.", ingredients: ["Chicken breast", "Quinoa", "Broccoli", "Olive oil", "Lemon"], share: 0.32 },
  { name: "Mediterranean Chickpea Bowl", description: "Chickpeas, cucumber, tomato and tahini.", ingredients: ["Chickpeas", "Cucumber", "Tomato", "Tahini", "Parsley"], share: 0.32 },
  { name: "Salmon & Sweet Potato", description: "Baked salmon with sweet potato and greens.", ingredients: ["Salmon", "Sweet potato", "Spinach", "Olive oil", "Garlic"], share: 0.32 },
];

const DINNERS: MealTemplate[] = [
  { name: "Lean Beef & Veggie Stir-fry", description: "Stir-fried beef with mixed vegetables and rice.", ingredients: ["Lean beef", "Brown rice", "Bell pepper", "Broccoli", "Soy sauce"], share: 0.33 },
  { name: "Lentil Coconut Curry", description: "Hearty red lentil curry with spinach.", ingredients: ["Red lentils", "Light coconut milk", "Spinach", "Tomato", "Curry spices"], share: 0.33 },
  { name: "Baked White Fish & Greens", description: "Flaky white fish with steamed greens and potatoes.", ingredients: ["White fish", "Potato", "Green beans", "Olive oil", "Herbs"], share: 0.33 },
];

const SNACKS: MealTemplate[] = [
  { name: "Apple & Almonds", description: "Crisp apple with a handful of almonds.", ingredients: ["Apple", "Almonds"], share: 0.1 },
  { name: "Cottage Cheese Cup", description: "Low-fat cottage cheese with strawberries.", ingredients: ["Cottage cheese", "Strawberries"], share: 0.1 },
  { name: "Hummus & Veggies", description: "Hummus with carrot and pepper sticks.", ingredients: ["Hummus", "Carrot", "Bell pepper"], share: 0.1 },
  { name: "Whey Protein Shake", description: "Quick post-workout protein shake.", ingredients: ["Whey protein", "Almond milk", "Banana"], share: 0.1 },
];

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function pick<T>(list: T[], index: number): T {
  return list[index % list.length];
}

function buildMeal(type: MealType, template: MealTemplate, calories: number): {
  type: MealType;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
} {
  const kcal = safeRound(calories * template.share);
  // Rough macro split: 30% protein, 40% carbs, 30% fat.
  return {
    type,
    name: template.name,
    description: template.description,
    calories: kcal,
    protein: safeRound((kcal * 0.3) / 4),
    carbs: safeRound((kcal * 0.4) / 4),
    fat: safeRound((kcal * 0.3) / 9),
    ingredients: template.ingredients,
  };
}

/** Build a deterministic, restriction-aware 7-day fallback plan. */
export function buildMockMealPlan(
  profile: UserProfile,
  targets: NutritionTargets,
): MealPlan {
  const calories = Math.max(safeRound(targets.calories, 2000), 1200);
  const isVegan = profile.restrictions.includes("vegan");
  const isVegetarian =
    isVegan || profile.restrictions.includes("vegetarian");
  const noNuts = profile.restrictions.includes("nut-allergy");

  const breakfasts = isVegan ? [BREAKFASTS[1], BREAKFASTS[2]] : BREAKFASTS;
  const lunches = isVegetarian ? [LUNCHES[1]] : LUNCHES;
  const dinners = isVegetarian ? [DINNERS[1]] : DINNERS;
  let snacks = SNACKS;
  if (isVegan) snacks = [SNACKS[2], SNACKS[0]];
  if (noNuts) snacks = snacks.filter((s) => !s.ingredients.includes("Almonds") && !s.ingredients.includes("Peanut butter"));

  const start = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const dayName = DAY_NAMES[date.getDay()];
    const meals = [
      buildMeal("breakfast", pick(isVegan ? breakfasts : BREAKFASTS, i), calories),
      buildMeal("lunch", pick(lunches, i), calories),
      buildMeal("dinner", pick(dinners, i + 1), calories),
      buildMeal("snacks", pick(snacks.length ? snacks : SNACKS, i), calories),
    ];
    const totalCalories = meals.reduce((sum, m) => sum + m.calories, 0);
    return { day: dayName, date: toDateKey(date), totalCalories, meals };
  });

  return {
    id: createId("plan"),
    generatedAt: new Date().toISOString(),
    days,
  };
}

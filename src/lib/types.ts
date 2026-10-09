export type Gender = "male" | "female" | "other";

export type ActivityLevel =
  | "sedentary"
  | "lightly"
  | "moderately"
  | "very";

export type Goal =
  | "weight-loss"
  | "muscle-gain"
  | "maintenance"
  | "endurance";

export type DietaryRestriction =
  | "vegan"
  | "vegetarian"
  | "keto"
  | "gluten-free"
  | "dairy-free"
  | "nut-allergy"
  | "none";

export type WeightUnit = "kg" | "lbs";
export type HeightUnit = "cm" | "in";

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

/** The persisted user profile. All body metrics are stored in metric units. */
export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  /** Always kilograms. */
  weight: number;
  weightUnit: WeightUnit;
  /** Always centimeters. */
  height: number;
  heightUnit: HeightUnit;
  activityLevel: ActivityLevel;
  goal: Goal;
  restrictions: DietaryRestriction[];
  /** Optional user override for daily calories. */
  customCalorieTarget: number | null;
  createdAt: string;
}

/** The computed daily nutrition goals. */
export interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionTargets extends MacroNutrients {
  calories: number;
  bmr: number;
  tdee: number;
}

export interface FoodItem {
  id: string;
  name: string;
  /** Human-readable serving description, e.g. "1 cup (240ml)". */
  serving: string;
  /** Per-serving values. */
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

export interface LoggedFood {
  logId: string;
  foodId: string;
  name: string;
  serving: string;
  quantity: number;
  mealType: MealType;
  /** Date in YYYY-MM-DD. */
  date: string;
  loggedAt: string;
  /** Totals for quantity * per-serving values. */
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyLog {
  date: string;
  water: number;
  foods: LoggedFood[];
}

export interface Meal {
  type: MealType;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
}

export interface DayPlan {
  /** e.g. "Monday". */
  day: string;
  /** Date in YYYY-MM-DD. */
  date: string;
  totalCalories: number;
  meals: Meal[];
}

export interface MealPlan {
  id: string;
  generatedAt: string;
  days: DayPlan[];
}

export interface Tip {
  id: string;
  text: string;
  tag: string;
}

/** Daily aggregated totals derived from logged foods. */
export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

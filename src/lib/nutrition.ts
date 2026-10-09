import type {
  ActivityLevel,
  DietaryRestriction,
  Gender,
  Goal,
  MacroNutrients,
  NutritionTargets,
  UserProfile,
} from "./types";

/** A safe numeric fallback used everywhere to prevent NaN / Infinity leaking. */
export const SAFE_FALLBACK = 0;

/** Coerce any value to a finite number, returning `fallback` otherwise. */
export function safeNumber(
  value: unknown,
  fallback: number = SAFE_FALLBACK,
): number {
  const n = typeof value === "string" ? Number(value) : (value as number);
  if (typeof n !== "number" || !Number.isFinite(n)) return fallback;
  return n;
}

/** Round to a whole number safely. */
export function safeRound(value: unknown, fallback = 0): number {
  return Math.round(safeNumber(value, fallback));
}

/** Clamp a value between min and max, guarding against NaN. */
export function clamp(value: number, min: number, max: number): number {
  const v = safeNumber(value, min);
  return Math.min(Math.max(v, min), max);
}

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly: 1.375,
  moderately: 1.55,
  very: 1.725,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  lightly: "Lightly Active",
  moderately: "Moderately Active",
  very: "Very Active",
};

export const GOAL_LABELS: Record<Goal, string> = {
  "weight-loss": "Weight Loss",
  "muscle-gain": "Muscle Gain",
  maintenance: "Maintenance",
  endurance: "Endurance",
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

export const RESTRICTION_LABELS: Record<DietaryRestriction, string> = {
  vegan: "Vegan",
  vegetarian: "Vegetarian",
  keto: "Keto",
  "gluten-free": "Gluten-Free",
  "dairy-free": "Dairy-Free",
  "nut-allergy": "Nut Allergy",
  none: "None",
};

/** Calorie multiplier applied to TDEE for each goal. */
const GOAL_CALORIE_FACTORS: Record<Goal, number> = {
  "weight-loss": 0.8,
  "muscle-gain": 1.1,
  maintenance: 1,
  endurance: 1.05,
};

/** Protein grams per kg of bodyweight, by goal. */
const GOAL_PROTEIN_PER_KG: Record<Goal, number> = {
  "weight-loss": 2.0,
  "muscle-gain": 2.2,
  maintenance: 1.6,
  endurance: 1.8,
};

export const DEFAULT_PROFILE: UserProfile = {
  name: "",
  age: 0,
  gender: "male",
  weight: 0,
  weightUnit: "kg",
  height: 0,
  heightUnit: "cm",
  activityLevel: "moderately",
  goal: "maintenance",
  restrictions: ["none"],
  customCalorieTarget: null,
  createdAt: "",
};

export function kgToLbs(kg: number): number {
  return safeNumber(kg) * 2.20462;
}

export function lbsToKg(lbs: number): number {
  return safeNumber(lbs) / 2.20462;
}

export function cmToIn(cm: number): number {
  return safeNumber(cm) / 2.54;
}

export function inToCm(inches: number): number {
  return safeNumber(inches) * 2.54;
}

/**
 * Mifflin-St Jeor Basal Metabolic Rate.
 * Guards against zero / missing inputs so the result is always finite.
 */
export function calculateBMR(profile: UserProfile): number {
  const weight = clamp(profile.weight, 20, 500);
  const height = clamp(profile.height, 80, 260);
  const age = clamp(profile.age, 10, 120);

  const base = 10 * weight + 6.25 * height - 5 * age;
  if (profile.gender === "female") return safeRound(base - 161);
  if (profile.gender === "male") return safeRound(base + 5);
  // "other" - neutral midpoint offset.
  return safeRound(base - 78);
}

/** Total Daily Energy Expenditure. */
export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  const factor = ACTIVITY_FACTORS[profile.activityLevel] ?? 1.2;
  return safeRound(safeNumber(bmr, 1500) * factor);
}

/**
 * Compute the full daily nutrition target from a profile.
 * If a custom calorie target is set (and valid) it takes precedence.
 */
export function calculateTargets(profile: UserProfile): NutritionTargets {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(profile);

  const goalFactor = GOAL_CALORIE_FACTORS[profile.goal] ?? 1;
  let calories = safeRound(tdee * goalFactor, 2000);

  const custom = safeNumber(profile.customCalorieTarget, 0);
  if (custom > 0) calories = safeRound(custom, calories);

  // Never go below a safe floor.
  calories = Math.max(calories, 1200);

  const weight = clamp(profile.weight, 20, 500);
  const perKg = GOAL_PROTEIN_PER_KG[profile.goal] ?? 1.6;
  let protein = safeRound(weight * perKg);

  // Keto => very low carb, higher fat.
  const isKeto = profile.restrictions.includes("keto");
  const fatPct = isKeto ? 0.7 : 0.25;

  let fat = safeRound((calories * fatPct) / 9);

  // Protein cannot exceed 40% of calories.
  const maxProtein = safeRound((calories * 0.4) / 4);
  protein = Math.min(protein, maxProtein);
  if (protein <= 0) protein = safeRound((calories * 0.25) / 4);

  let carbs = safeRound((calories - protein * 4 - fat * 9) / 4);
  if (isKeto) carbs = clamp(carbs, 20, 50);
  if (carbs < 0) {
    // Fat + protein overshoot: reduce fat and retry.
    fat = Math.max(20, safeRound((calories - protein * 4 - 20 * 4) / 9));
    carbs = Math.max(0, safeRound((calories - protein * 4 - fat * 9) / 4));
  }

  return {
    bmr: safeRound(bmr, 1500),
    tdee: safeRound(tdee, 2000),
    calories,
    protein,
    carbs,
    fat,
  };
}

/** Normalized macro calorie split as percentages that sum to ~100. */
export function macroPercentages(targets: MacroNutrients): MacroNutrients {
  const p = safeNumber(targets.protein) * 4;
  const c = safeNumber(targets.carbs) * 4;
  const f = safeNumber(targets.fat) * 9;
  const total = p + c + f;
  if (total <= 0) return { protein: 0, carbs: 0, fat: 0 };
  return {
    protein: Math.round((p / total) * 100),
    carbs: Math.round((c / total) * 100),
    fat: Math.round((f / total) * 100),
  };
}

/** Safe percentage for progress bars (0-100+). */
export function percentOf(value: unknown, total: unknown): number {
  const v = safeNumber(value, 0);
  const t = safeNumber(total, 0);
  if (t <= 0) return 0;
  const pct = (v / t) * 100;
  return Number.isFinite(pct) ? Math.round(pct) : 0;
}

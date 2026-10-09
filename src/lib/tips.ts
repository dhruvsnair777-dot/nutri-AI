import type { Tip } from "./types";

export const DAILY_TIPS: Tip[] = [
  { id: "t1", text: "Drink a glass of water before each meal — it helps with satiety and hydration.", tag: "Hydration" },
  { id: "t2", text: "Fill half your plate with vegetables to boost fiber and micronutrients for very few calories.", tag: "Plate method" },
  { id: "t3", text: "Aim for 25–35g of protein at breakfast to steady your energy and curb mid-morning cravings.", tag: "Protein" },
  { id: "t4", text: "Choose whole grains over refined carbs — the extra fiber slows digestion and keeps you full.", tag: "Carbs" },
  { id: "t5", text: "Healthy fats from olive oil, avocado, and nuts support hormones and vitamin absorption.", tag: "Fats" },
  { id: "t6", text: "Eat slowly and put your fork down between bites; it takes ~20 minutes for fullness to register.", tag: "Mindfulness" },
  { id: "t7", text: "Prep tomorrow's lunch tonight — planning is the single biggest predictor of hitting your targets.", tag: "Habits" },
  { id: "t8", text: "Don't drink your calories: sugary drinks add up fast with little satiety.", tag: "Awareness" },
  { id: "t9", text: "Pair iron-rich foods with vitamin C (like citrus) to improve absorption.", tag: "Nutrients" },
  { id: "t10", text: "Movement counts: a 10-minute walk after meals can improve blood sugar control.", tag: "Activity" },
  { id: "t11", text: "Keep healthy snacks visible and treats out of sight — environment beats willpower.", tag: "Habits" },
  { id: "t12", text: "Sleep 7–9 hours. Poor sleep raises hunger hormones and cravings the next day.", tag: "Recovery" },
];

/** Return a random tip, optionally avoiding the one with `excludeId`. */
export function randomTip(excludeId?: string): Tip {
  const pool = excludeId
    ? DAILY_TIPS.filter((t) => t.id !== excludeId)
    : DAILY_TIPS;
  const list = pool.length > 0 ? pool : DAILY_TIPS;
  return list[Math.floor(Math.random() * list.length)];
}

import type { FoodItem } from "./types";

/**
 * A curated offline food database. Values are per-serving estimates.
 * Used for the Food Search page so the app works without any network calls.
 */
export const FOOD_DATABASE: FoodItem[] = [
  { id: "f_oatmeal", name: "Oatmeal, cooked", serving: "1 cup (234g)", calories: 154, protein: 6, carbs: 27, fat: 3, category: "Grains" },
  { id: "f_brown_rice", name: "Brown rice, cooked", serving: "1 cup (195g)", calories: 216, protein: 5, carbs: 45, fat: 2, category: "Grains" },
  { id: "f_white_rice", name: "White rice, cooked", serving: "1 cup (158g)", calories: 205, protein: 4, carbs: 45, fat: 0.4, category: "Grains" },
  { id: "f_quinoa", name: "Quinoa, cooked", serving: "1 cup (185g)", calories: 222, protein: 8, carbs: 39, fat: 4, category: "Grains" },
  { id: "f_whole_bread", name: "Whole wheat bread", serving: "1 slice (28g)", calories: 69, protein: 4, carbs: 12, fat: 1, category: "Grains" },
  { id: "f_pasta", name: "Whole wheat pasta, cooked", serving: "1 cup (140g)", calories: 174, protein: 7, carbs: 37, fat: 0.8, category: "Grains" },
  { id: "f_chicken_breast", name: "Chicken breast, grilled", serving: "100g", calories: 165, protein: 31, carbs: 0, fat: 3.6, category: "Protein" },
  { id: "f_salmon", name: "Salmon, baked", serving: "100g", calories: 208, protein: 20, carbs: 0, fat: 13, category: "Protein" },
  { id: "f_tuna", name: "Tuna, canned in water", serving: "100g", calories: 116, protein: 26, carbs: 0, fat: 0.8, category: "Protein" },
  { id: "f_eggs", name: "Egg, whole, boiled", serving: "1 large (50g)", calories: 78, protein: 6, carbs: 0.6, fat: 5, category: "Protein" },
  { id: "f_tofu", name: "Tofu, firm", serving: "100g", calories: 144, protein: 17, carbs: 3, fat: 9, category: "Protein" },
  { id: "f_tempeh", name: "Tempeh", serving: "100g", calories: 192, protein: 20, carbs: 8, fat: 11, category: "Protein" },
  { id: "f_lentils", name: "Lentils, cooked", serving: "1 cup (198g)", calories: 230, protein: 18, carbs: 40, fat: 0.8, category: "Protein" },
  { id: "f_chickpeas", name: "Chickpeas, cooked", serving: "1 cup (164g)", calories: 269, protein: 15, carbs: 45, fat: 4, category: "Protein" },
  { id: "f_black_beans", name: "Black beans, cooked", serving: "1 cup (172g)", calories: 227, protein: 15, carbs: 41, fat: 0.9, category: "Protein" },
  { id: "f_greek_yogurt", name: "Greek yogurt, plain non-fat", serving: "1 cup (245g)", calories: 133, protein: 23, carbs: 9, fat: 0.7, category: "Dairy" },
  { id: "f_cottage_cheese", name: "Cottage cheese, low-fat", serving: "1 cup (226g)", calories: 163, protein: 28, carbs: 6, fat: 2.3, category: "Dairy" },
  { id: "f_milk", name: "Milk, skim", serving: "1 cup (245ml)", calories: 83, protein: 8, carbs: 12, fat: 0.2, category: "Dairy" },
  { id: "f_almond_milk", name: "Almond milk, unsweetened", serving: "1 cup (240ml)", calories: 39, protein: 1.5, carbs: 3.4, fat: 2.5, category: "Dairy" },
  { id: "f_cheddar", name: "Cheddar cheese", serving: "1 slice (28g)", calories: 113, protein: 7, carbs: 0.4, fat: 9, category: "Dairy" },
  { id: "f_apple", name: "Apple, raw", serving: "1 medium (182g)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3, category: "Fruit" },
  { id: "f_banana", name: "Banana, raw", serving: "1 medium (118g)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4, category: "Fruit" },
  { id: "f_blueberries", name: "Blueberries", serving: "1 cup (148g)", calories: 84, protein: 1.1, carbs: 21, fat: 0.5, category: "Fruit" },
  { id: "f_strawberries", name: "Strawberries", serving: "1 cup (152g)", calories: 49, protein: 1, carbs: 12, fat: 0.5, category: "Fruit" },
  { id: "f_orange", name: "Orange, raw", serving: "1 medium (131g)", calories: 62, protein: 1.2, carbs: 15, fat: 0.2, category: "Fruit" },
  { id: "f_avocado", name: "Avocado", serving: "1/2 medium (100g)", calories: 160, protein: 2, carbs: 9, fat: 15, category: "Fruit" },
  { id: "f_broccoli", name: "Broccoli, steamed", serving: "1 cup (156g)", calories: 55, protein: 3.7, carbs: 11, fat: 0.6, category: "Vegetables" },
  { id: "f_spinach", name: "Spinach, raw", serving: "1 cup (30g)", calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, category: "Vegetables" },
  { id: "f_sweet_potato", name: "Sweet potato, baked", serving: "1 medium (150g)", calories: 130, protein: 2.4, carbs: 30, fat: 0.2, category: "Vegetables" },
  { id: "f_potato", name: "Potato, baked", serving: "1 medium (173g)", calories: 161, protein: 4.3, carbs: 37, fat: 0.2, category: "Vegetables" },
  { id: "f_carrot", name: "Carrots, raw", serving: "1 cup (128g)", calories: 52, protein: 1.2, carbs: 12, fat: 0.3, category: "Vegetables" },
  { id: "f_bell_pepper", name: "Bell pepper, raw", serving: "1 cup (149g)", calories: 46, protein: 1.5, carbs: 9, fat: 0.4, category: "Vegetables" },
  { id: "f_olive_oil", name: "Olive oil", serving: "1 tbsp (14g)", calories: 119, protein: 0, carbs: 0, fat: 14, category: "Fats" },
  { id: "f_almonds", name: "Almonds", serving: "1 oz (28g)", calories: 164, protein: 6, carbs: 6, fat: 14, category: "Nuts" },
  { id: "f_peanut_butter", name: "Peanut butter", serving: "2 tbsp (32g)", calories: 188, protein: 8, carbs: 6, fat: 16, category: "Nuts" },
  { id: "f_walnuts", name: "Walnuts", serving: "1 oz (28g)", calories: 185, protein: 4, carbs: 4, fat: 18, category: "Nuts" },
  { id: "f_chia", name: "Chia seeds", serving: "1 tbsp (12g)", calories: 58, protein: 2, carbs: 5, fat: 4, category: "Nuts" },
  { id: "f_whey", name: "Whey protein powder", serving: "1 scoop (30g)", calories: 120, protein: 24, carbs: 3, fat: 1.5, category: "Supplements" },
  { id: "f_dark_chocolate", name: "Dark chocolate (70%)", serving: "1 oz (28g)", calories: 170, protein: 2, carbs: 13, fat: 12, category: "Snacks" },
  { id: "f_hummus", name: "Hummus", serving: "2 tbsp (30g)", calories: 70, protein: 2, carbs: 6, fat: 5, category: "Snacks" },
  { id: "f_popcorn", name: "Popcorn, air-popped", serving: "3 cups (24g)", calories: 93, protein: 3, carbs: 19, fat: 1.1, category: "Snacks" },
  { id: "f_rice_cake", name: "Rice cake, plain", serving: "1 cake (9g)", calories: 35, protein: 0.7, carbs: 7, fat: 0.3, category: "Snacks" },
];

export const FOOD_CATEGORIES: string[] = Array.from(
  new Set(FOOD_DATABASE.map((f) => f.category)),
);

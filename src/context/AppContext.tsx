"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  DailyLog,
  FoodItem,
  LoggedFood,
  MealPlan,
  MealType,
  NutritionTargets,
  UserProfile,
} from "@/lib/types";
import { calculateTargets } from "@/lib/nutrition";
import { createId, emptyLog, toDateKey } from "@/lib/utils";

const STORAGE_KEYS = {
  profile: "nutria.profile.v1",
  logs: "nutria.logs.v1",
  plan: "nutria.mealplan.v1",
} as const;

export interface AppContextValue {
  isReady: boolean;
  profile: UserProfile | null;
  targets: NutritionTargets | null;
  dailyLogs: Record<string, DailyLog>;
  mealPlan: MealPlan | null;
  saveProfile: (profile: UserProfile) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  clearProfile: () => void;
  clearAll: () => void;
  getLog: (date?: string) => DailyLog;
  logFood: (
    food: FoodItem,
    quantity: number,
    mealType: MealType,
    date?: string,
  ) => void;
  removeFood: (logId: string, date?: string) => void;
  clearDay: (date?: string) => void;
  setWater: (glasses: number, date?: string) => void;
  addWater: (delta: number, date?: string) => void;
  saveMealPlan: (plan: MealPlan) => void;
  clearMealPlan: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — fail silently */
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>({});
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);

  // Hydrate from localStorage exactly once on mount.
  useEffect(() => {
    const storedProfile = readJSON<UserProfile | null>(
      STORAGE_KEYS.profile,
      null,
    );
    const storedLogs = readJSON<Record<string, DailyLog>>(
      STORAGE_KEYS.logs,
      {},
    );
    const storedPlan = readJSON<MealPlan | null>(STORAGE_KEYS.plan, null);

    // Guard: only accept a profile that looks structurally valid.
    if (
      storedProfile &&
      typeof storedProfile === "object" &&
      typeof storedProfile.name === "string" &&
      storedProfile.name.trim().length > 0
    ) {
      setProfile(storedProfile);
    }
    if (storedLogs && typeof storedLogs === "object") setDailyLogs(storedLogs);
    if (storedPlan && Array.isArray(storedPlan.days)) setMealPlan(storedPlan);

    setIsReady(true);
  }, []);

  // Persist profile. Gated on `isReady` so the initial (empty) state never
  // overwrites data that is still being hydrated from localStorage.
  useEffect(() => {
    if (!isReady) return;
    if (profile) writeJSON(STORAGE_KEYS.profile, profile);
  }, [profile, isReady]);

  // Persist logs.
  useEffect(() => {
    if (!isReady) return;
    writeJSON(STORAGE_KEYS.logs, dailyLogs);
  }, [dailyLogs, isReady]);

  // Persist meal plan.
  useEffect(() => {
    if (!isReady) return;
    if (mealPlan) writeJSON(STORAGE_KEYS.plan, mealPlan);
  }, [mealPlan, isReady]);

  const targets = useMemo(
    () => (profile ? calculateTargets(profile) : null),
    [profile],
  );

  const saveProfile = useCallback((next: UserProfile) => {
    setProfile({ ...next, createdAt: next.createdAt || new Date().toISOString() });
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const clearProfile = useCallback(() => {
    setProfile(null);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEYS.profile);
      } catch {
        /* noop */
      }
    }
  }, []);

  const clearAll = useCallback(() => {
    setProfile(null);
    setDailyLogs({});
    setMealPlan(null);
    if (typeof window !== "undefined") {
      try {
        Object.values(STORAGE_KEYS).forEach((k) =>
          window.localStorage.removeItem(k),
        );
      } catch {
        /* noop */
      }
    }
  }, []);

  const getLog = useCallback(
    (date?: string): DailyLog => {
      const key = date ?? toDateKey();
      return dailyLogs[key] ?? emptyLog(key);
    },
    [dailyLogs],
  );

  const logFood = useCallback(
    (food: FoodItem, quantity: number, mealType: MealType, date?: string) => {
      const key = date ?? toDateKey();
      const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
      const entry: LoggedFood = {
        logId: createId("log"),
        foodId: food.id,
        name: food.name,
        serving: food.serving,
        quantity: qty,
        mealType,
        date: key,
        loggedAt: new Date().toISOString(),
        calories: Math.round(food.calories * qty),
        protein: Math.round(food.protein * qty * 10) / 10,
        carbs: Math.round(food.carbs * qty * 10) / 10,
        fat: Math.round(food.fat * qty * 10) / 10,
      };
      setDailyLogs((prev) => {
        const current = prev[key] ?? emptyLog(key);
        return {
          ...prev,
          [key]: { ...current, foods: [entry, ...current.foods] },
        };
      });
    },
    [],
  );

  const removeFood = useCallback((logId: string, date?: string) => {
    const key = date ?? toDateKey();
    setDailyLogs((prev) => {
      const current = prev[key] ?? emptyLog(key);
      return {
        ...prev,
        [key]: {
          ...current,
          foods: current.foods.filter((f) => f.logId !== logId),
        },
      };
    });
  }, []);

  const clearDay = useCallback((date?: string) => {
    const key = date ?? toDateKey();
    setDailyLogs((prev) => ({
      ...prev,
      [key]: emptyLog(key),
    }));
  }, []);

  const setWater = useCallback((glasses: number, date?: string) => {
    const key = date ?? toDateKey();
    const value = Math.max(0, Math.min(30, Math.round(glasses) || 0));
    setDailyLogs((prev) => {
      const current = prev[key] ?? emptyLog(key);
      return { ...prev, [key]: { ...current, water: value } };
    });
  }, []);

  const addWater = useCallback(
    (delta: number, date?: string) => {
      const key = date ?? toDateKey();
      setDailyLogs((prev) => {
        const current = prev[key] ?? emptyLog(key);
        const next = Math.max(
          0,
          Math.min(30, (Number(current.water) || 0) + delta),
        );
        return { ...prev, [key]: { ...current, water: next } };
      });
    },
    [],
  );

  const saveMealPlan = useCallback((plan: MealPlan) => setMealPlan(plan), []);
  const clearMealPlan = useCallback(() => {
    setMealPlan(null);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEYS.plan);
      } catch {
        /* noop */
      }
    }
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      isReady,
      profile,
      targets,
      dailyLogs,
      mealPlan,
      saveProfile,
      updateProfile,
      clearProfile,
      clearAll,
      getLog,
      logFood,
      removeFood,
      clearDay,
      setWater,
      addWater,
      saveMealPlan,
      clearMealPlan,
    }),
    [
      isReady,
      profile,
      targets,
      dailyLogs,
      mealPlan,
      saveProfile,
      updateProfile,
      clearProfile,
      clearAll,
      getLog,
      logFood,
      removeFood,
      clearDay,
      setWater,
      addWater,
      saveMealPlan,
      clearMealPlan,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an <AppProvider>.");
  }
  return ctx;
}

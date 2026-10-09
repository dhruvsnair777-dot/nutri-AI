"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Check,
  Dumbbell,
  Flame,
  LogOut,
  RotateCcw,
  Save,
  Scale,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type {
  ActivityLevel,
  DietaryRestriction,
  Gender,
  Goal,
  HeightUnit,
  UserProfile,
  WeightUnit,
} from "@/lib/types";
import {
  ACTIVITY_LABELS,
  GENDER_LABELS,
  GOAL_LABELS,
  RESTRICTION_LABELS,
  calculateTargets,
  cmToIn,
  inToCm,
  kgToLbs,
  lbsToKg,
  macroPercentages,
  safeNumber,
} from "@/lib/nutrition";
import { Badge, Button, Card, CardHeader } from "@/components/ui";
import { cn, formatNumber } from "@/lib/utils";

interface FormState {
  name: string;
  age: string;
  gender: Gender;
  weight: string;
  weightUnit: WeightUnit;
  height: string;
  heightUnit: HeightUnit;
  activityLevel: ActivityLevel;
  goal: Goal;
  restrictions: DietaryRestriction[];
  customCalorieTarget: string;
}

function profileToForm(p: UserProfile): FormState {
  const displayWeight =
    p.weightUnit === "lbs" ? kgToLbs(p.weight) : safeNumber(p.weight);
  const displayHeight =
    p.heightUnit === "in" ? cmToIn(p.height) : safeNumber(p.height);
  return {
    name: p.name,
    age: p.age ? String(p.age) : "",
    gender: p.gender,
    weight: displayWeight > 0 ? displayWeight.toFixed(1) : "",
    weightUnit: p.weightUnit,
    height: displayHeight > 0 ? displayHeight.toFixed(1) : "",
    heightUnit: p.heightUnit,
    activityLevel: p.activityLevel,
    goal: p.goal,
    restrictions: p.restrictions.length ? p.restrictions : ["none"],
    customCalorieTarget: p.customCalorieTarget
      ? String(p.customCalorieTarget)
      : "",
  };
}

export default function ProfilePage() {
  const { profile, updateProfile, clearProfile, clearAll } = useApp();
  const [form, setForm] = useState<FormState | null>(
    profile ? profileToForm(profile) : null,
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formProfile: UserProfile | null = useMemo(() => {
    if (!form || !profile) return null;
    const weightKg =
      form.weightUnit === "kg"
        ? safeNumber(form.weight)
        : lbsToKg(safeNumber(form.weight));
    const heightCm =
      form.heightUnit === "cm"
        ? safeNumber(form.height)
        : inToCm(safeNumber(form.height));
    return {
      ...profile,
      name: form.name.trim() || profile.name,
      age: safeNumber(form.age),
      gender: form.gender,
      weight: weightKg,
      weightUnit: form.weightUnit,
      height: heightCm,
      heightUnit: form.heightUnit,
      activityLevel: form.activityLevel,
      goal: form.goal,
      restrictions: form.restrictions.length ? form.restrictions : ["none"],
      customCalorieTarget:
        safeNumber(form.customCalorieTarget, 0) > 0
          ? safeNumber(form.customCalorieTarget)
          : null,
    };
  }, [form, profile]);

  const liveTargets = useMemo(
    () => (formProfile ? calculateTargets(formProfile) : null),
    [formProfile],
  );

  if (!profile || !form || !formProfile || !liveTargets) return null;

  const split = macroPercentages(liveTargets);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
    setError(null);
  }

  function toggleRestriction(value: DietaryRestriction) {
    if (!form) return;
    setSaved(false);
    if (value === "none") {
      patch("restrictions", ["none"]);
      return;
    }
    const withoutNone = form.restrictions.filter((r) => r !== "none");
    patch(
      "restrictions",
      withoutNone.includes(value)
        ? withoutNone.filter((r) => r !== value)
        : [...withoutNone, value],
    );
  }

  function save() {
    if (!formProfile) return;
    if (!formProfile.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    if (formProfile.weight <= 0 || formProfile.height <= 0) {
      setError("Please enter a valid weight and height.");
      return;
    }
    updateProfile(formProfile);
    setSaved(true);
    setError(null);
  }

  function reset() {
    if (!form || !profile) return;
    setForm(profileToForm(profile));
    setSaved(false);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h1 className="text-lg font-bold">My Profile</h1>
        <p className="mt-0.5 text-sm text-muted">
          Update your details — targets recalculate automatically.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader
              title="Personal details"
              icon={<UserRound className="h-4 w-4" />}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Labeled label="Name">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => patch("name", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </Labeled>
              <Labeled label="Age">
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => patch("age", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </Labeled>
              <Labeled label="Gender">
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => patch("gender", g)}
                      className={cn(
                        "rounded-xl border px-2 py-2 text-xs font-medium transition-colors",
                        form.gender === g
                          ? "border-brand bg-brand-soft/60 text-brand-dark"
                          : "border-border hover:border-brand/40",
                      )}
                    >
                      {GENDER_LABELS[g]}
                    </button>
                  ))}
                </div>
              </Labeled>
              <Labeled label="Activity level">
                <select
                  value={form.activityLevel}
                  onChange={(e) =>
                    patch("activityLevel", e.target.value as ActivityLevel)
                  }
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand"
                >
                  {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((a) => (
                    <option key={a} value={a}>
                      {ACTIVITY_LABELS[a]}
                    </option>
                  ))}
                </select>
              </Labeled>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Body metrics"
              icon={<Scale className="h-4 w-4" />}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Labeled label="Weight">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => patch("weight", e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <UnitToggle
                    options={["kg", "lbs"]}
                    value={form.weightUnit}
                    onChange={(u) => {
                      const to = u as WeightUnit;
                      if (to === form.weightUnit) return;
                      const v = safeNumber(form.weight, 0);
                      patch(
                        "weight",
                        v > 0
                          ? (to === "kg" ? lbsToKg(v) : kgToLbs(v)).toFixed(1)
                          : "",
                      );
                      setForm((prev) =>
                        prev ? { ...prev, weightUnit: to } : prev,
                      );
                    }}
                  />
                </div>
              </Labeled>
              <Labeled label="Height">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) => patch("height", e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <UnitToggle
                    options={["cm", "in"]}
                    value={form.heightUnit}
                    onChange={(u) => {
                      const to = u as HeightUnit;
                      if (to === form.heightUnit) return;
                      const v = safeNumber(form.height, 0);
                      patch(
                        "height",
                        v > 0
                          ? (to === "cm" ? inToCm(v) : cmToIn(v)).toFixed(1)
                          : "",
                      );
                      setForm((prev) =>
                        prev ? { ...prev, heightUnit: to } : prev,
                      );
                    }}
                  />
                </div>
              </Labeled>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Goal & diet"
              icon={<Dumbbell className="h-4 w-4" />}
            />
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => patch("goal", g)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors",
                    form.goal === g
                      ? "border-brand bg-brand-soft/60 text-brand-dark"
                      : "border-border hover:border-brand/40",
                  )}
                >
                  {GOAL_LABELS[g]}
                </button>
              ))}
            </div>

            <p className="mt-5 text-xs font-medium text-muted">
              Dietary restrictions
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  "vegan",
                  "vegetarian",
                  "keto",
                  "gluten-free",
                  "dairy-free",
                  "nut-allergy",
                  "none",
                ] as DietaryRestriction[]
              ).map((r) => {
                const active = form.restrictions.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRestriction(r)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      active
                        ? "border-brand bg-brand-soft/60 text-brand-dark"
                        : "border-border text-muted hover:border-brand/40",
                    )}
                  >
                    {active ? <Check className="h-3 w-3" /> : null}
                    {RESTRICTION_LABELS[r]}
                  </button>
                );
              })}
            </div>

            <div className="mt-5">
              <Labeled label="Custom daily calorie target (optional)">
                <input
                  type="number"
                  value={form.customCalorieTarget}
                  onChange={(e) =>
                    patch("customCalorieTarget", e.target.value)
                  }
                  placeholder={`Recommended: ${liveTargets.calories} kcal`}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </Labeled>
            </div>
          </Card>

          {error ? (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
              {error}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <Button onClick={save}>
              <Save className="h-4 w-4" /> Save changes
            </Button>
            <Button variant="secondary" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Discard
            </Button>
            {saved ? (
              <span className="flex items-center gap-1 text-xs font-medium text-brand">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            ) : null}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Calculated targets"
              subtitle="Live preview based on your inputs"
              icon={<Sparkles className="h-4 w-4" />}
            />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <TargetBox label="Calories" value={formatNumber(liveTargets.calories)} unit="kcal" color="text-brand" />
              <TargetBox label="Protein" value={`${liveTargets.protein}`} unit="g" color="text-accent" />
              <TargetBox label="Carbs" value={`${liveTargets.carbs}`} unit="g" color="text-warning" />
              <TargetBox label="Fat" value={`${liveTargets.fat}`} unit="g" color="text-violet-500" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="brand">
                <Flame className="h-3 w-3" /> BMR {liveTargets.bmr}
              </Badge>
              <Badge tone="accent">
                <Activity className="h-3 w-3" /> TDEE {liveTargets.tdee}
              </Badge>
            </div>
            <div className="mt-5">
              <p className="text-xs font-medium text-muted">Macro split</p>
              <div className="mt-2 space-y-3">
                <SplitRow label="Protein" pct={split.protein} tone="bg-accent" />
                <SplitRow label="Carbs" pct={split.carbs} tone="bg-warning" />
                <SplitRow label="Fat" pct={split.fat} tone="bg-violet-500" />
              </div>
            </div>
          </Card>

          <Card className="border-danger/20">
            <CardHeader
              title="Account & data"
              subtitle="Log out or start fresh"
              icon={<Trash2 className="h-4 w-4" />}
            />
            <p className="mt-3 text-xs text-muted">
              <strong>Log out</strong> keeps your logs and returns you to
              onboarding to enter a new profile.{" "}
              <strong>Start new</strong> permanently clears everything in this
              browser.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (
                    window.confirm(
                      "Log out? You'll return to onboarding to enter new data.",
                    )
                  ) {
                    clearProfile();
                  }
                }}
              >
                <LogOut className="h-4 w-4" /> Log out
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  if (
                    window.confirm(
                      "Start a new profile? This permanently clears your local data.",
                    )
                  ) {
                    clearAll();
                  }
                }}
              >
                <Trash2 className="h-4 w-4" /> Start new profile
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function UnitToggle({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex shrink-0 rounded-xl border border-border bg-background p-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
            value === opt
              ? "bg-brand text-white"
              : "text-muted hover:text-foreground",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function TargetBox({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 text-center">
      <p className="text-[11px] text-muted">{label}</p>
      <p className={cn("text-lg font-bold", color)}>
        {value}
        <span className="ml-0.5 text-xs font-normal text-muted">{unit}</span>
      </p>
    </div>
  );
}

function SplitRow({
  label,
  pct,
  tone,
}: {
  label: string;
  pct: number;
  tone: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className={cn("h-full rounded-full", tone)}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

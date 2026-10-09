"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Beef,
  Check,
  Droplets,
  Dumbbell,
  Flame,
  Leaf,
  Nut,
  Scale,
  Sparkles,
  Target,
  User,
  Wheat,
} from "lucide-react";
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
  GOAL_LABELS,
  GENDER_LABELS,
  RESTRICTION_LABELS,
  calculateTargets,
  cmToIn,
  inToCm,
  kgToLbs,
  lbsToKg,
  safeNumber,
} from "@/lib/nutrition";
import { cn, formatNumber } from "@/lib/utils";
import { Badge, Button, ProgressBar } from "@/components/ui";

interface WizardProps {
  onComplete: (profile: UserProfile) => void;
}

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

const STEPS = [
  "Basic Info",
  "Body Metrics",
  "Activity",
  "Goal",
  "Diet",
  "Target",
] as const;

const GOAL_ICONS: Record<Goal, typeof Flame> = {
  "weight-loss": Flame,
  "muscle-gain": Dumbbell,
  maintenance: Scale,
  endurance: Activity,
};

const RESTRICTION_ICONS: Partial<Record<DietaryRestriction, typeof Leaf>> = {
  vegan: Leaf,
  vegetarian: Leaf,
  keto: Beef,
  "gluten-free": Wheat,
  "dairy-free": Droplets,
  "nut-allergy": Nut,
};

const initialForm: FormState = {
  name: "",
  age: "",
  gender: "male",
  weight: "",
  weightUnit: "kg",
  height: "",
  heightUnit: "cm",
  activityLevel: "moderately",
  goal: "weight-loss",
  restrictions: [],
  customCalorieTarget: "",
};

export default function OnboardingWizard({ onComplete }: WizardProps) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function toggleRestriction(value: DietaryRestriction) {
    setForm((prev) => {
      if (value === "none") {
        return { ...prev, restrictions: ["none"] };
      }
      const withoutNone = prev.restrictions.filter((r) => r !== "none");
      const exists = withoutNone.includes(value);
      const next = exists
        ? withoutNone.filter((r) => r !== value)
        : [...withoutNone, value];
      return { ...prev, restrictions: next };
    });
  }

  // Convert the form to a canonical (metric) profile for the live preview.
  const previewProfile: UserProfile = useMemo(() => {
    const weightKg =
      form.weightUnit === "kg"
        ? safeNumber(form.weight)
        : lbsToKg(safeNumber(form.weight));
    const heightCm =
      form.heightUnit === "cm"
        ? safeNumber(form.height)
        : inToCm(safeNumber(form.height));
    return {
      name: form.name.trim() || "Friend",
      age: safeNumber(form.age),
      gender: form.gender,
      weight: weightKg,
      weightUnit: form.weightUnit,
      height: heightCm,
      heightUnit: form.heightUnit,
      activityLevel: form.activityLevel,
      goal: form.goal,
      restrictions:
        form.restrictions.length > 0 ? form.restrictions : ["none"],
      customCalorieTarget:
        safeNumber(form.customCalorieTarget, 0) > 0
          ? safeNumber(form.customCalorieTarget)
          : null,
      createdAt: "",
    };
  }, [form]);

  const previewTargets = useMemo(
    () => calculateTargets(previewProfile),
    [previewProfile],
  );

  function validateStep(): string | null {
    if (step === 0) {
      if (!form.name.trim()) return "Please enter your name.";
      const age = safeNumber(form.age, 0);
      if (age < 10 || age > 120) return "Please enter a valid age (10–120).";
    }
    if (step === 1) {
      const w = safeNumber(form.weight, 0);
      const h = safeNumber(form.height, 0);
      if (w <= 0) return "Please enter your weight.";
      if (h <= 0) return "Please enter your height.";
      if (form.weightUnit === "kg" && (w < 20 || w > 400))
        return "Weight should be between 20 and 400 kg.";
      if (form.weightUnit === "lbs" && (w < 44 || w > 880))
        return "Weight should be between 44 and 880 lbs.";
      if (form.heightUnit === "cm" && (h < 80 || h > 260))
        return "Height should be between 80 and 260 cm.";
      if (form.heightUnit === "in" && (h < 31 || h > 102))
        return "Height should be between 31 and 102 in.";
    }
    return null;
  }

  function next() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function finish() {
    const err = validateStep();
    if (err) {
      setError(err);
      return;
    }
    setSubmitting(true);
    setError(null);
    // Simulate the brief target calculation for a polished loading state.
    window.setTimeout(() => {
      onComplete({
        ...previewProfile,
        name: form.name.trim(),
        createdAt: new Date().toISOString(),
      });
    }, 700);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background lg:flex-row">
      {/* Brand rail */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-brand px-6 py-8 text-white lg:w-[38%] lg:px-12 lg:py-12">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-black/10"
          aria-hidden
        />
        <div className="relative">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
              <Leaf className="h-5 w-5" />
            </span>
            NutriAI
          </div>
          <h1 className="mt-8 max-w-sm text-2xl font-bold leading-tight lg:text-3xl">
            Let&apos;s build your personalized nutrition plan.
          </h1>
          <p className="mt-3 max-w-sm text-sm text-white/80">
            Answer a few quick questions and we&apos;ll calculate your daily
            calories and macros using the Mifflin-St Jeor equation.
          </p>
        </div>

        <div className="relative mt-8 hidden lg:block">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-white/70">
              Live target preview
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <PreviewStat label="Calories" value={`${formatNumber(previewTargets.calories)}`} unit="kcal" />
              <PreviewStat label="Protein" value={`${previewTargets.protein}`} unit="g" />
              <PreviewStat label="Carbs" value={`${previewTargets.carbs}`} unit="g" />
              <PreviewStat label="Fat" value={`${previewTargets.fat}`} unit="g" />
            </div>
          </div>
        </div>
      </aside>

      {/* Form */}
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-xl animate-fade-in">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              Step {step + 1} of {STEPS.length}
            </p>
            <h2 className="mt-1 text-xl font-bold text-foreground">
              {STEPS[step]}
            </h2>
            <div className="mt-3">
              <ProgressBar
                value={((step + 1) / STEPS.length) * 100}
                height="h-1.5"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            {step === 0 && (
              <div className="space-y-5">
                <Field label="What should we call you?" icon={<User className="h-4 w-4" />}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => patch("name", e.target.value)}
                    placeholder="e.g. Anuj"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    autoFocus
                  />
                </Field>
                <Field label="Age" icon={<User className="h-4 w-4" />}>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={form.age}
                    onChange={(e) => patch("age", e.target.value)}
                    placeholder="Years"
                    min={10}
                    max={120}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </Field>
                <Field label="Gender" icon={<User className="h-4 w-4" />}>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
                      <Choice
                        key={g}
                        active={form.gender === g}
                        onClick={() => patch("gender", g)}
                        label={GENDER_LABELS[g]}
                      />
                    ))}
                  </div>
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <Field label="Weight" icon={<Scale className="h-4 w-4" />}>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={form.weight}
                      onChange={(e) => patch("weight", e.target.value)}
                      placeholder={form.weightUnit === "kg" ? "e.g. 72" : "e.g. 159"}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                      autoFocus
                    />
                    <UnitToggle
                      options={["kg", "lbs"]}
                      value={form.weightUnit}
                      onChange={(u) => {
                        const from = form.weightUnit;
                        const to = u as WeightUnit;
                        if (from === to) return;
                        const v = safeNumber(form.weight, 0);
                        const converted =
                          to === "kg" ? lbsToKg(v) : kgToLbs(v);
                        setForm((prev) => ({
                          ...prev,
                          weightUnit: to,
                          weight: v > 0 ? converted.toFixed(1) : "",
                        }));
                      }}
                    />
                  </div>
                </Field>
                <Field label="Height" icon={<Scale className="h-4 w-4 rotate-90" />}>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={form.height}
                      onChange={(e) => patch("height", e.target.value)}
                      placeholder={form.heightUnit === "cm" ? "e.g. 175" : "e.g. 69"}
                      className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                    <UnitToggle
                      options={["cm", "in"]}
                      value={form.heightUnit}
                      onChange={(u) => {
                        const from = form.heightUnit;
                        const to = u as HeightUnit;
                        if (from === to) return;
                        const v = safeNumber(form.height, 0);
                        const converted =
                          to === "cm" ? inToCm(v) : cmToIn(v);
                        setForm((prev) => ({
                          ...prev,
                          heightUnit: to,
                          height: v > 0 ? converted.toFixed(1) : "",
                        }));
                      }}
                    />
                  </div>
                </Field>
                <div className="rounded-xl bg-background p-3 text-xs text-muted">
                  We store your metrics in metric units and use them only to
                  calculate your targets. Nothing leaves your browser.
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => patch("activityLevel", a)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border p-3.5 text-left text-sm transition-colors",
                      form.activityLevel === a
                        ? "border-brand bg-brand-soft/60"
                        : "border-border bg-background hover:border-brand/40",
                    )}
                  >
                    <span className="font-medium">{ACTIVITY_LABELS[a]}</span>
                    <span className="text-xs text-muted">
                      {ACTIVITY_DESCRIPTIONS[a]}
                    </span>
                    {form.activityLevel === a ? (
                      <Check className="h-4 w-4 text-brand" />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(Object.keys(GOAL_LABELS) as Goal[]).map((g) => {
                  const Icon = GOAL_ICONS[g];
                  const active = form.goal === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => patch("goal", g)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors",
                        active
                          ? "border-brand bg-brand-soft/60"
                          : "border-border bg-background hover:border-brand/40",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg",
                          active
                            ? "bg-brand text-white"
                            : "bg-black/[0.05] text-muted",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-semibold">
                        {GOAL_LABELS[g]}
                      </span>
                      <span className="text-xs text-muted">
                        {GOAL_DESCRIPTIONS[g]}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                <p className="text-xs text-muted">
                  Select all that apply. Choose <strong>None</strong> if you
                  have no restrictions.
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                    const Icon = RESTRICTION_ICONS[r] ?? Sparkles;
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleRestriction(r)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors",
                          active
                            ? "border-brand bg-brand-soft/60"
                            : "border-border bg-background hover:border-brand/40",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded-md border",
                            active
                              ? "border-brand bg-brand text-white"
                              : "border-border",
                          )}
                        >
                          {active ? <Check className="h-3.5 w-3.5" /> : null}
                        </span>
                        <Icon className="h-4 w-4 text-muted" />
                        <span className="font-medium">
                          {RESTRICTION_LABELS[r]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <Field
                  label="Custom daily calorie target (optional)"
                  icon={<Target className="h-4 w-4" />}
                  hint="Leave blank to use our calculated recommendation."
                >
                  <input
                    type="number"
                    inputMode="numeric"
                    value={form.customCalorieTarget}
                    onChange={(e) =>
                      patch("customCalorieTarget", e.target.value)
                    }
                    placeholder={`Recommended: ${previewTargets.calories} kcal`}
                    min={1200}
                    max={6000}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                </Field>

                <div className="rounded-2xl border border-brand/20 bg-brand-soft/40 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-brand" />
                    <p className="text-sm font-semibold">
                      Your calculated targets
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <TargetStat label="Calories" value={formatNumber(previewTargets.calories)} unit="kcal" color="text-brand" />
                    <TargetStat label="Protein" value={`${previewTargets.protein}`} unit="g" color="text-accent" />
                    <TargetStat label="Carbs" value={`${previewTargets.carbs}`} unit="g" color="text-warning" />
                    <TargetStat label="Fat" value={`${previewTargets.fat}`} unit="g" color="text-violet-500" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="brand">BMR {previewTargets.bmr} kcal</Badge>
                    <Badge tone="accent">TDEE {previewTargets.tdee} kcal</Badge>
                    <Badge>{GOAL_LABELS[form.goal]}</Badge>
                  </div>
                  <p className="mt-3 text-[11px] text-muted">
                    These are estimates for planning only and not medical
                    advice. Targets recalculate as you edit your profile.
                  </p>
                </div>
              </div>
            )}

            {error ? (
              <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={back}
                disabled={step === 0 || submitting}
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={finish} disabled={submitting} size="lg">
                  {submitting ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      Calculating targets...
                    </>
                  ) : (
                    <>
                      Create my plan <Sparkles className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <p className="mt-4 text-center text-[11px] text-muted">
            🔒 Your data is stored locally in your browser. Demo app — not
            medical advice.
          </p>
        </div>
      </main>
    </div>
  );
}

const ACTIVITY_DESCRIPTIONS: Record<ActivityLevel, string> = {
  sedentary: "Little or no exercise",
  lightly: "1–3 workouts / week",
  moderately: "3–5 workouts / week",
  very: "6–7 workouts / week",
};

const GOAL_DESCRIPTIONS: Record<Goal, string> = {
  "weight-loss": "Lose fat at a sustainable pace",
  "muscle-gain": "Build lean muscle mass",
  maintenance: "Stay at your current weight",
  endurance: "Fuel longer training sessions",
};

function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        {icon ? <span className="text-muted">{icon}</span> : null}
        {label}
      </label>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Choice({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-brand bg-brand-soft/60 text-brand-dark"
          : "border-border bg-background hover:border-brand/40",
      )}
    >
      {label}
    </button>
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
            "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
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

function PreviewStat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl bg-white/10 p-2.5">
      <p className="text-[11px] text-white/70">{label}</p>
      <p className="text-lg font-bold">
        {value}
        <span className="ml-1 text-xs font-normal text-white/70">{unit}</span>
      </p>
    </div>
  );
}

function TargetStat({
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
    <div className="rounded-xl bg-card p-3 text-center">
      <p className="text-[11px] text-muted">{label}</p>
      <p className={cn("text-lg font-bold", color)}>
        {value}
        <span className="ml-0.5 text-xs font-normal text-muted">{unit}</span>
      </p>
    </div>
  );
}

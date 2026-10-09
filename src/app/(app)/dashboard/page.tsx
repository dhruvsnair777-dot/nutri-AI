"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { roundedTotals, toDateKey } from "@/lib/utils";
import OverviewBanner, {
  buildDateOptions,
} from "@/components/dashboard/OverviewBanner";
import CaloriesCard from "@/components/dashboard/CaloriesCard";
import MacrosGrid from "@/components/dashboard/MacrosGrid";
import MacroBreakdown from "@/components/dashboard/MacroBreakdown";
import MealPlanPreviewCard from "@/components/dashboard/MealPlanPreviewCard";
import WaterTracker from "@/components/dashboard/WaterTracker";
import DailyTipCard from "@/components/dashboard/DailyTipCard";

export default function DashboardPage() {
  const { profile, targets, getLog, addWater, mealPlan } = useApp();
  const [date, setDate] = useState<string>(() => toDateKey());
  const dateOptions = useMemo(() => buildDateOptions(), []);

  if (!profile || !targets) {
    // AppShell guarantees a profile, this is purely a type guard.
    return null;
  }

  const log = getLog(date);
  const totals = roundedTotals(log.foods);
  const restriction =
    profile.restrictions.length > 0 ? profile.restrictions.join(", ") : "none";

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <OverviewBanner
        name={profile.name}
        selectedDate={date}
        onDateChange={setDate}
        days={dateOptions}
        caloriesTarget={targets.calories}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <CaloriesCard totals={totals} targets={targets} />
          <MacrosGrid totals={totals} targets={targets} />
          <MacroBreakdown totals={totals} targets={targets} />
        </div>

        <div className="space-y-4">
          <MealPlanPreviewCard mealPlan={mealPlan} date={date} />
          <WaterTracker
            glasses={log.water}
            onAdd={() => addWater(1, date)}
            onRemove={() => addWater(-1, date)}
          />
          <DailyTipCard goal={profile.goal} restriction={restriction} />
        </div>
      </div>
    </div>
  );
}

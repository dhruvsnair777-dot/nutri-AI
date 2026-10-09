"use client";

import { Droplets, Minus, Plus } from "lucide-react";
import { Button, Card, CardHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

const GLASS_GOAL = 8;

interface WaterTrackerProps {
  glasses: number;
  onAdd: () => void;
  onRemove: () => void;
}

export default function WaterTracker({
  glasses,
  onAdd,
  onRemove,
}: WaterTrackerProps) {
  const value = Number.isFinite(glasses) ? Math.max(0, Math.round(glasses)) : 0;
  const pct = Math.round((Math.min(value, GLASS_GOAL) / GLASS_GOAL) * 100);
  const goalReached = value >= GLASS_GOAL;

  return (
    <Card className="animate-fade-in">
      <CardHeader
        title="Water tracker"
        subtitle="Goal: 8 glasses (2L) per day"
        icon={<Droplets className="h-4 w-4" />}
        action={
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              goalReached
                ? "bg-brand-soft text-brand-dark"
                : "bg-accent/10 text-accent",
            )}
          >
            {goalReached ? "Goal reached 🎉" : `${pct}%`}
          </span>
        }
      />

      <p className="mt-4 text-2xl font-bold">
        {value}
        <span className="ml-1 text-base font-medium text-muted">
          / {GLASS_GOAL} glasses
        </span>
      </p>

      <div className="mt-4 grid grid-cols-8 gap-1.5">
        {Array.from({ length: GLASS_GOAL }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex h-10 items-center justify-center rounded-lg border transition-colors",
              i < value
                ? "border-accent/30 bg-accent/15 text-accent"
                : "border-border bg-background text-muted/40",
            )}
            aria-hidden
          >
            <Droplets className="h-4 w-4" />
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={onRemove}
          disabled={value <= 0}
        >
          <Minus className="h-4 w-4" /> Remove
        </Button>
        <Button size="sm" className="flex-1" onClick={onAdd} disabled={value >= 30}>
          <Plus className="h-4 w-4" /> Add glass
        </Button>
      </div>
    </Card>
  );
}

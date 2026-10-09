"use client";

import { useCallback, useEffect, useState } from "react";
import { Lightbulb, RefreshCw } from "lucide-react";
import type { Tip } from "@/lib/types";
import { Button, Card, CardHeader, Skeleton } from "@/components/ui";
import { randomTip } from "@/lib/tips";

interface DailyTipCardProps {
  goal: string;
  restriction: string;
}

export default function DailyTipCard({ goal, restriction }: DailyTipCardProps) {
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTip = useCallback(
    async (excludeId?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ goal, restriction });
        if (excludeId) params.set("exclude", excludeId);
        const res = await fetch(`/api/tips?${params.toString()}`);
        if (!res.ok) throw new Error("tip request failed");
        const data = (await res.json()) as { tip?: Tip };
        if (!data.tip || typeof data.tip.text !== "string") {
          throw new Error("bad tip payload");
        }
        setTip(data.tip);
      } catch {
        // Local fallback ensures the card is never empty.
        setTip(randomTip(excludeId));
      } finally {
        setLoading(false);
      }
    },
    [goal, restriction],
  );

  useEffect(() => {
    void fetchTip();
  }, [fetchTip]);

  return (
    <Card className="animate-fade-in bg-gradient-to-br from-card to-brand-soft/30">
      <CardHeader
        title="Daily nutrition tip"
        subtitle={tip?.tag ? `AI advice · ${tip.tag}` : "AI advice"}
        icon={<Lightbulb className="h-4 w-4" />}
      />

      <div className="mt-4 min-h-[72px]">
        {loading || !tip ? (
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-5/6" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-foreground">{tip.text}</p>
        )}
      </div>

      <Button
        variant="secondary"
        size="sm"
        className="mt-4"
        onClick={() => void fetchTip(tip?.id)}
        disabled={loading}
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        Another tip
      </Button>
    </Card>
  );
}

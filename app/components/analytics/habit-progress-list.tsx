"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Flame } from "lucide-react";
import { Heatmap, type HeatmapCell } from "@/components/analytics/heatmap";
import { cn } from "@/lib/utils";
import type { AnalyticsApiResponse } from "@/lib/api-client";

function MiniPillBar({ rate }: { rate: number }) {
  const clamped = Math.max(0, Math.min(100, rate));
  return (
    <div className="relative h-14 w-7 shrink-0 overflow-hidden rounded-full bg-primary-20">
      <div
        className="absolute inset-x-0 bottom-0 rounded-full bg-gradient-to-t from-primary-120 to-primary-60 transition-all duration-500"
        style={{ height: `${Math.max(clamped, clamped > 0 ? 8 : 0)}%` }}
      />
    </div>
  );
}

type HabitProgressCardProps = {
  habitId: string;
  name: string;
  current: number;
  longest: number;
  active: boolean;
  heatmapDays: { date: string; status: HeatmapCell["status"] }[];
  completionRate?: number;
};

export function HabitProgressCard({
  name,
  current,
  longest,
  active,
  heatmapDays,
  completionRate = 0,
}: HabitProgressCardProps) {
  const [open, setOpen] = useState(false);
  const cells = useMemo(
    () => heatmapDays.map((d) => ({ date: d.date, status: d.status })),
    [heatmapDays]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-20 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <MiniPillBar rate={completionRate} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-100">{name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-60">
            <span className="inline-flex items-center gap-1">
              <Flame
                className={cn(
                  "h-3.5 w-3.5",
                  active ? "fill-primary-100 text-primary-100" : "text-gray-30"
                )}
              />
              {current}d current · {longest}d best
            </span>
            <span className="rounded-full bg-primary-20 px-2 py-0.5 font-medium text-primary-100">
              {completionRate}%
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-gray-30 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-gray-10 px-4 pb-4 pt-3">
          <p className="mb-2 text-xs font-medium text-gray-60">17-week history</p>
          <Heatmap cells={cells} />
        </div>
      )}
    </div>
  );
}

export function HabitProgressList({
  streaks,
  heatmaps,
}: {
  streaks: AnalyticsApiResponse["streaks"];
  heatmaps: AnalyticsApiResponse["heatmaps"]["byHabit"];
}) {
  if (streaks.length === 0) {
    return (
      <p className="text-sm text-gray-60">
        Add habits to see per-habit progress here.
      </p>
    );
  }

  const heatmapById = new Map(heatmaps.map((h) => [h.habitId, h.days]));

  function rateFromHeatmap(days: { status: HeatmapCell["status"] }[]) {
    const relevant = days.filter((d) => d.status !== "upcoming");
    if (relevant.length === 0) return 0;
    const done = relevant.filter((d) => d.status === "completed").length;
    return Math.round((done / relevant.length) * 100);
  }

  return (
    <div className="space-y-3">
      {streaks.map((streak) => (
        <HabitProgressCard
          key={streak.habitId}
          habitId={streak.habitId}
          name={streak.name}
          current={streak.current}
          longest={streak.longest}
          active={streak.active}
          heatmapDays={heatmapById.get(streak.habitId) ?? []}
          completionRate={rateFromHeatmap(heatmapById.get(streak.habitId) ?? [])}
        />
      ))}
    </div>
  );
}

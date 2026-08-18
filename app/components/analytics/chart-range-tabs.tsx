"use client";

import { cn } from "@/lib/utils";
import { CHART_RANGES, type ChartRange } from "@/lib/chart-theme";

export function ChartRangeTabs({
  value,
  onChange,
  locked,
  onLocked,
  className,
}: {
  value: ChartRange;
  onChange: (range: ChartRange) => void;
  locked?: ChartRange[];
  onLocked?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex rounded-full bg-gray-10 p-1 ring-1 ring-gray-20",
        className
      )}
    >
      {CHART_RANGES.map((range) => {
        const active = value === range.id;
        const isLocked = locked?.includes(range.id);
        return (
          <button
            key={range.id}
            type="button"
            onClick={() => (isLocked ? onLocked?.() : onChange(range.id))}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide transition",
              active
                ? "bg-primary-100 text-white shadow-sm shadow-primary-100/30"
                : "text-gray-60 hover:text-primary-100",
              isLocked && "opacity-60"
            )}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}


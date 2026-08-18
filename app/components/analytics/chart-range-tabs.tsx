"use client";

import { cn } from "@/lib/utils";
import { CHART_RANGES, type ChartRange } from "@/lib/chart-theme";

export function ChartRangeTabs({
  value,
  onChange,
  className,
}: {
  value: ChartRange;
  onChange: (range: ChartRange) => void;
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
        return (
          <button
            key={range.id}
            type="button"
            onClick={() => onChange(range.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide transition",
              active
                ? "bg-primary-100 text-white shadow-sm shadow-primary-100/30"
                : "text-gray-60 hover:text-primary-100"
            )}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}

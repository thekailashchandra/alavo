"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { statusFill } from "@/lib/status";
import type { DayStatus } from "@/lib/habits";

export type HeatmapCell = {
  date: string;
  status: DayStatus;
  count?: number;
};

type HeatmapProps = {
  cells: HeatmapCell[];
  className?: string;
};

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getWeeks(cells: HeatmapCell[]) {
  const weeks: (HeatmapCell | null)[][] = [];
  let currentWeek: (HeatmapCell | null)[] = [];

  cells.forEach((cell, index) => {
    if (index === 0) {
      const dayOfWeek = parseISO(cell.date).getDay();
      const mondayBased = (dayOfWeek + 6) % 7;
      for (let i = 0; i < mondayBased; i++) {
        currentWeek.push(null);
      }
    }

    currentWeek.push(cell);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  return weeks;
}

export function Heatmap({ cells, className }: HeatmapProps) {
  const weeks = useMemo(() => getWeeks(cells), [cells]);

  const monthLabels = useMemo(() => {
    const labels: { weekIndex: number; label: string }[] = [];
    let lastMonth = "";

    weeks.forEach((week, weekIndex) => {
      const first = week.find((c) => c !== null);
      if (!first) return;
      const month = format(parseISO(first.date), "MMM");
      if (month !== lastMonth) {
        labels.push({ weekIndex, label: month });
        lastMonth = month;
      }
    });

    return labels;
  }, [weeks]);

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="inline-block min-w-full">
        <div className="mb-2 flex gap-[3px] pl-7 text-[10px] text-muted-foreground">
          {monthLabels.map(({ weekIndex, label }) => (
            <span
              key={`${weekIndex}-${label}`}
              className="shrink-0"
              style={{ marginLeft: weekIndex === 0 ? 0 : `${weekIndex * 13 - 14}px` }}
            >
              {label}
            </span>
          ))}
        </div>

        <div className="flex gap-[3px]">
          <div className="flex flex-col gap-[3px] pt-0.5">
            {DAY_LABELS.map((label, i) => (
              <span
                key={i}
                className="flex h-[11px] items-center text-[9px] leading-none text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell, di) => (
                  <div
                    key={`${wi}-${di}`}
                    title={
                      cell
                        ? `${cell.date}: ${cell.status}${cell.count != null ? ` (${cell.count})` : ""}`
                        : undefined
                    }
                    className={cn(
                      "h-[11px] w-[11px] rounded-[2px]",
                      !cell && "bg-transparent"
                    )}
                    style={
                      cell
                        ? {
                            backgroundColor:
                              cell.count != null && cell.count > 0
                                ? statusFill[cell.status]
                                : statusFill[cell.status],
                            opacity:
                              cell.count != null
                                ? Math.min(1, 0.35 + cell.count * 0.15)
                                : 1,
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          {(["empty", "missed_long", "missed_recent", "completed"] as DayStatus[]).map(
            (status) => (
              <div
                key={status}
                className="h-[11px] w-[11px] rounded-[2px]"
                style={{ backgroundColor: statusFill[status] }}
              />
            )
          )}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

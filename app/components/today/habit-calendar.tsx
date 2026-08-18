"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsApiResponse } from "@/lib/api-client";

type HabitCalendarProps = {
  selectedDate: string;
  todayDate: string;
  onSelectDate: (date: string) => void;
  heatmap?: AnalyticsApiResponse["heatmaps"]["overall"];
};

function rateColor(rate: number, isFuture: boolean) {
  if (isFuture) return "bg-primary-20/50 text-gray-30";
  if (rate === 0) return "bg-primary-20 text-gray-30";
  if (rate < 50) return "bg-primary-30 text-primary-120";
  if (rate < 100) return "bg-primary-30 text-primary-120";
  return "bg-primary-100 text-white";
}

export function HabitCalendar({
  selectedDate,
  todayDate,
  onSelectDate,
  heatmap = [],
}: HabitCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => parseISO(selectedDate));

  const rateByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const day of heatmap) {
      map.set(day.date, day.rate);
    }
    return map;
  }, [heatmap]);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const leadingBlanks = monthStart.getDay();

  return (
    <section className="mx-5 rounded-2xl border border-gray-20 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-100">Habit calendar</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-60 hover:bg-primary-20 hover:text-primary-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[7rem] text-center text-xs font-medium text-primary-100">
            {format(viewMonth, "MMMM yyyy")}
          </span>
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-60 hover:bg-primary-20 hover:text-primary-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-gray-60">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const date = format(day, "yyyy-MM-dd");
          const isFuture = date > todayDate;
          const rate = rateByDate.get(date) ?? 0;
          const selected = date === selectedDate;
          const isToday = date === todayDate;

          return (
            <button
              key={date}
              type="button"
              disabled={isFuture}
              onClick={() => onSelectDate(date)}
              className={cn(
                "flex h-9 flex-col items-center justify-center rounded-lg text-[11px] font-semibold transition",
                rateColor(rate, isFuture),
                selected && "ring-2 ring-primary-100 ring-offset-1",
                isToday && !selected && "ring-1 ring-primary-60"
              )}
              aria-label={`${format(day, "MMM d")}, ${rate}% complete`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-center text-[11px] text-gray-60">
        Tap a day to view habits · darker = higher completion
      </p>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { format, parseISO, startOfWeek } from "date-fns";
import { ChevronDown } from "lucide-react";
import { ChartRangeTabs } from "@/components/analytics/chart-range-tabs";
import { ModernAreaChart } from "@/components/analytics/modern-area-chart";
import { ModernPillBarChart } from "@/components/analytics/modern-pill-bar-chart";
import type { AnalyticsApiResponse } from "@/lib/api-client";
import {
  type ChartDataPoint,
  type ChartRange,
} from "@/lib/chart-theme";

const WEEKDAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function dayLabel(date: string) {
  const weekday = (parseISO(date).getDay() + 6) % 7;
  return WEEKDAY_LABELS[weekday] ?? format(parseISO(date), "EEEEE");
}

function buildDailySeries(
  overall: AnalyticsApiResponse["heatmaps"]["overall"],
  days: number,
  today: string
): ChartDataPoint[] {
  return overall.slice(-days).map((day) => ({
    label: days <= 7 ? dayLabel(day.date) : format(parseISO(day.date), "d"),
    rate: day.rate,
    due: day.due,
    done: day.done,
    date: day.date,
    isToday: day.date === today,
  }));
}

function buildWeeklySeries(
  overall: AnalyticsApiResponse["heatmaps"]["overall"],
  weeks: number
): ChartDataPoint[] {
  const buckets = new Map<string, { due: number; done: number }>();

  for (const day of overall) {
    const weekStart = format(
      startOfWeek(parseISO(day.date), { weekStartsOn: 1 }),
      "yyyy-MM-dd"
    );
    const bucket = buckets.get(weekStart) ?? { due: 0, done: 0 };
    bucket.due += day.due;
    bucket.done += day.done;
    buckets.set(weekStart, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-weeks)
    .map(([start, { due, done }]) => ({
      label: format(parseISO(start), "MMM d"),
      due,
      done,
      rate: due === 0 ? 0 : Math.round((done / due) * 100),
      date: start,
    }));
}

function buildMonthlySeries(
  overall: AnalyticsApiResponse["heatmaps"]["overall"],
  months: number
): ChartDataPoint[] {
  const buckets = new Map<string, { due: number; done: number }>();

  for (const day of overall) {
    const monthKey = day.date.slice(0, 7);
    const bucket = buckets.get(monthKey) ?? { due: 0, done: 0 };
    bucket.due += day.due;
    bucket.done += day.done;
    buckets.set(monthKey, bucket);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-months)
    .map(([monthKey, { due, done }]) => ({
      label: format(parseISO(`${monthKey}-01`), "MMM"),
      due,
      done,
      rate: due === 0 ? 0 : Math.round((done / due) * 100),
      date: monthKey,
    }));
}

type StatsChartsProps = {
  overall: AnalyticsApiResponse["heatmaps"]["overall"];
  todayDate: string;
};

export function StatsCharts({ overall, todayDate }: StatsChartsProps) {
  const [dailyRange, setDailyRange] = useState<ChartRange>("7d");
  const [weeklyRange, setWeeklyRange] = useState<ChartRange>("26w");

  const dailyData = useMemo(() => {
    if (dailyRange === "7d") return buildDailySeries(overall, 7, todayDate);
    if (dailyRange === "31d") return buildDailySeries(overall, 31, todayDate);
    if (dailyRange === "26w") return buildWeeklySeries(overall, 26);
    return buildMonthlySeries(overall, 12);
  }, [overall, dailyRange, todayDate]);

  const weeklyData = useMemo(() => {
    if (weeklyRange === "12m") return buildMonthlySeries(overall, 12);
    if (weeklyRange === "26w") return buildWeeklySeries(overall, 26);
    if (weeklyRange === "31d") return buildDailySeries(overall, 31, todayDate);
    return buildDailySeries(overall, 7, todayDate);
  }, [overall, weeklyRange, todayDate]);

  const dailyUsesArea = dailyRange === "7d" || dailyRange === "31d";
  const weeklyUsesBars = weeklyRange === "26w" || weeklyRange === "12m";

  return (
    <div className="space-y-4">
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-gray-100">Daily goals</h2>
            <ChevronDown className="h-4 w-4 text-gray-30" />
          </div>
          <ChartRangeTabs value={dailyRange} onChange={setDailyRange} />
        </div>
        {dailyUsesArea ? (
          <ModernAreaChart
            data={dailyData}
            title="Completion rate"
            subtitle="Daily habit completion with today highlighted"
          />
        ) : (
          <ModernPillBarChart
            data={dailyData}
            title="Completion rate"
            subtitle={
              dailyRange === "26w" ? "Weekly aggregated completion" : "Monthly completion"
            }
          />
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-sm font-semibold text-gray-100">Weekly goals</h2>
            <ChevronDown className="h-4 w-4 text-gray-30" />
          </div>
          <ChartRangeTabs value={weeklyRange} onChange={setWeeklyRange} />
        </div>
        {weeklyUsesBars ? (
          <ModernPillBarChart
            data={weeklyData}
            title="Habit progress"
            subtitle={
              weeklyRange === "26w"
                ? "Pill bars show weekly completion"
                : "Monthly progress overview"
            }
          />
        ) : (
          <ModernAreaChart
            data={weeklyData}
            title="Habit progress"
            subtitle="Daily completion trend"
          />
        )}
      </section>
    </div>
  );
}

export type { ChartDataPoint };

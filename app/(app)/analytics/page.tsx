"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format, parseISO, startOfWeek } from "date-fns";
import { Flame, Target, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { Heatmap } from "@/components/analytics/heatmap";
import { StatsCharts, type ChartDataPoint } from "@/components/analytics/stats-charts";
import { Card, CardContent } from "@/components/ui/card";
import { parseJson, type AnalyticsApiResponse } from "@/lib/api-client";
import { statusTextClass } from "@/lib/status";
import { rateToStatus } from "@/lib/habits";

function buildWeeklyChart(
  overall: AnalyticsApiResponse["heatmaps"]["overall"]
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
    .slice(-8)
    .map(([start, { due, done }]) => ({
      label: format(parseISO(start), "MMM d"),
      due,
      done,
      rate: due === 0 ? 0 : Math.round((done / due) * 100),
    }));
}

function buildMonthlyChart(
  overall: AnalyticsApiResponse["heatmaps"]["overall"]
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
    .slice(-6)
    .map(([monthKey, { due, done }]) => ({
      label: format(parseISO(`${monthKey}-01`), "MMM"),
      due,
      done,
      rate: due === 0 ? 0 : Math.round((done / due) * 100),
    }));
}

export default function AnalyticsPage() {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState<AnalyticsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/analytics");
      const json = await parseJson<AnalyticsApiResponse>(res);
      setData(json);
    } catch {
      toast.error("Could not load analytics");
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const heatmapCells = useMemo(
    () =>
      (data?.heatmaps.overall ?? []).map((d) => ({
        date: d.date,
        status: d.status,
        count: d.done,
      })),
    [data]
  );

  const weeklyChart = useMemo(
    () => buildWeeklyChart(data?.heatmaps.overall ?? []),
    [data]
  );

  const monthlyChart = useMemo(
    () => buildMonthlyChart(data?.heatmaps.overall ?? []),
    [data]
  );

  const bestStreak = useMemo(() => {
    const streaks = data?.streaks ?? [];
    return streaks.reduce((max, s) => Math.max(max, s.longest), 0);
  }, [data]);

  const currentStreak = useMemo(() => {
    const streaks = data?.streaks ?? [];
    return streaks.reduce((max, s) => Math.max(max, s.current), 0);
  }, [data]);

  const overallRate = data?.rates.monthly.rate ?? data?.overallCompletionPercent ?? 0;
  const rateStatus = rateToStatus(overallRate);

  return (
    <div className="space-y-6 pb-6">
      <header className="px-5 pt-8">
        <h1 className="brand-title text-2xl font-semibold tracking-tight">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Patterns, streaks, and completion over time.
        </p>
      </header>

      {loading ? (
        <div className="space-y-4 px-5">
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          <div className="h-40 animate-pulse rounded-2xl bg-muted" />
          <div className="h-48 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 px-5">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Flame className="h-4 w-4" />
                  <span className="text-xs">Current streak</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {currentStreak}
                  <span className="text-sm font-normal text-muted-foreground">
                    d
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Best streak</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {bestStreak}
                  <span className="text-sm font-normal text-muted-foreground">
                    d
                  </span>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span className="text-xs">Active habits</span>
                </div>
                <p className="mt-2 text-2xl font-semibold">
                  {data?.streaks.length ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">This month</p>
                <p className={`mt-2 text-2xl font-semibold ${statusTextClass[rateStatus]}`}>
                  {overallRate}%
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="px-5">
            <div className="rounded-2xl border border-border bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold">Activity</h2>
              <Heatmap cells={heatmapCells} />
            </div>
          </div>

          <div className="px-5">
            <StatsCharts weekly={weeklyChart} monthly={monthlyChart} />
          </div>

          {data?.bestDayOfWeek && (
            <div className="px-5">
              <div className="rounded-2xl border border-border bg-white p-5">
                <p className="text-sm text-muted-foreground">Best day</p>
                <p className="mt-1 text-lg font-semibold">
                  {data.bestDayOfWeek.dayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.bestDayOfWeek.completions} completions recorded
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

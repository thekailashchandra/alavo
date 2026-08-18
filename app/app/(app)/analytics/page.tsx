"use client";

import { useMemo, useState } from "react";
import {
  Award,
  Flame,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { Heatmap } from "@/components/analytics/heatmap";
import { HabitProgressList } from "@/components/analytics/habit-progress-list";
import { StatsCharts } from "@/components/analytics/stats-charts";
import { PaywallDialog } from "@/components/billing/paywall-dialog";
import { useAuth } from "@/components/providers/auth-provider";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { cacheKeys } from "@/lib/client-cache";
import { type AnalyticsApiResponse } from "@/lib/api-client";
import { getTodayInTimezone, rateToStatus } from "@/lib/habits";
import { statusTextClass } from "@/lib/status";
import type { FeatureKey } from "@/lib/billing/entitlements";
import { Button } from "@/components/ui/button";

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  suffix?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-20 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-gray-60">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary-20 text-primary-100">
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-xs">{label}</span>
      </div>
      <p
        className={`mt-2 text-2xl font-bold tabular-nums ${
          accent ? "text-primary-100" : "text-gray-100"
        }`}
      >
        {value}
        {suffix ? (
          <span className="text-sm font-normal text-gray-60">{suffix}</span>
        ) : null}
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const timezone = user?.timezone ?? "UTC";
  const todayDate = getTodayInTimezone(timezone);
  const [paywall, setPaywall] = useState<FeatureKey | null>(null);

  const { data, loading } = useCachedQuery<AnalyticsApiResponse>(
    cacheKeys.analytics,
    "/api/analytics"
  );
  const { data: coaching } = useCachedQuery<{
    locked: boolean;
    insights: { id: string; title: string; body: string; tone: string }[];
  }>(cacheKeys.coaching, "/api/coaching");

  const advanced = data?.advancedAnalytics ?? user?.billing?.features.advancedAnalytics ?? false;

  const heatmapCells = useMemo(
    () =>
      (data?.heatmaps.overall ?? []).map((d) => ({
        date: d.date,
        status: d.status,
        count: d.done,
      })),
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

  const goalsCompleted = useMemo(
    () => heatmapCells.filter((c) => c.status === "completed").length,
    [heatmapCells]
  );

  const goalsMissed = useMemo(
    () =>
      heatmapCells.filter(
        (c) => c.status === "missed_recent" || c.status === "missed_long"
      ).length,
    [heatmapCells]
  );

  const weeklyRate = data?.rates.weekly.rate ?? 0;
  const monthlyRate = data?.rates.monthly.rate ?? 0;
  const overallRate = data?.rates.overall?.rate ?? data?.overallCompletionPercent ?? 0;
  const rateStatus = rateToStatus(monthlyRate);

  return (
    <div className="space-y-6 pb-6">
      <header className="px-5 pt-8">
        <h1 className="brand-title text-2xl font-semibold tracking-tight text-gray-100">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-gray-60/80">
          {advanced
            ? "Progress charts, streaks, and habit insights."
            : "Last 30 days of basic streaks. Longer ranges are Pro."}
        </p>
      </header>

      {loading && !data ? (
        <div className="space-y-4 px-5">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
          <div className="h-56 animate-pulse rounded-2xl bg-muted" />
          <div className="h-56 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 px-5">
            <StatCard
              icon={Trophy}
              label="Longest streak ever"
              value={bestStreak}
              suffix="d"
              accent
            />
            <StatCard
              icon={Flame}
              label="Current streak"
              value={currentStreak}
              suffix="d"
              accent
            />
            <StatCard
              icon={Target}
              label="Goals completed"
              value={goalsCompleted}
            />
            <StatCard
              icon={Award}
              label="Goals missed"
              value={goalsMissed}
            />
          </div>

          <div className="px-5">
            <div className="grid grid-cols-3 gap-2 rounded-2xl border border-gray-20 bg-white p-3 shadow-sm">
              <div className="text-center">
                <p className="text-[10px] font-medium uppercase text-gray-60">Week</p>
                <p className="text-lg font-bold text-primary-100">{weeklyRate}%</p>
              </div>
              <div className="border-x border-gray-10 text-center">
                <p className="text-[10px] font-medium uppercase text-gray-60">Month</p>
                <p className={`text-lg font-bold ${statusTextClass[rateStatus]}`}>
                  {monthlyRate}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-medium uppercase text-gray-60">30 days</p>
                <p className="text-lg font-bold text-primary-100">{overallRate}%</p>
              </div>
            </div>
          </div>

          <div className="px-5">
            <StatsCharts
              overall={data?.heatmaps.overall ?? []}
              todayDate={todayDate}
              advanced={advanced}
              onUnlock={() => setPaywall("advancedAnalytics")}
            />
          </div>

          <div className="px-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-100">
              Progress by habit
            </h2>
            <HabitProgressList
              streaks={data?.streaks ?? []}
              heatmaps={data?.heatmaps.byHabit ?? []}
            />
          </div>

          <div className="px-5">
            <div className="rounded-2xl border border-gray-20 bg-white p-5 shadow-sm">
              <h2 className="mb-1 text-sm font-semibold text-gray-100">
                Overall activity
              </h2>
              <p className="mb-4 text-xs text-gray-60">
                {advanced
                  ? "Combined habit completion heatmap"
                  : "Last 30 days — full history is a Pro unlock"}
              </p>
              <Heatmap cells={heatmapCells} />
            </div>
          </div>

          {data?.bestDayOfWeek && (
            <div className="px-5">
              <div className="rounded-2xl border border-gray-20 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-60">Best day of week</p>
                <p className="mt-1 text-lg font-semibold text-primary-100">
                  {data.bestDayOfWeek.dayName}
                </p>
                <p className="text-xs text-gray-60">
                  {data.bestDayOfWeek.completions} completions recorded
                </p>
              </div>
            </div>
          )}

          <div className="px-5">
            <div className="rounded-2xl border border-gray-20 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary-100" />
                <h2 className="text-sm font-semibold text-gray-100">AI coaching</h2>
              </div>
              {coaching?.locked !== false ? (
                <>
                  <p className="text-sm text-gray-60">
                    Personalized insights from your own stats — a-la-carte, even on Free.
                  </p>
                  <Button
                    className="mt-3"
                    variant="outline"
                    onClick={() => setPaywall("aiCoaching")}
                  >
                    Unlock coaching
                  </Button>
                </>
              ) : (
                <ul className="space-y-3">
                  {(coaching?.insights ?? []).map((insight) => (
                    <li key={insight.id}>
                      <p className="text-sm font-medium text-gray-100">{insight.title}</p>
                      <p className="mt-1 text-xs text-gray-60">{insight.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      <PaywallDialog
        open={paywall != null}
        onOpenChange={(open) => {
          if (!open) setPaywall(null);
        }}
        feature={paywall ?? "advancedAnalytics"}
      />
    </div>
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { HabitChecklist } from "@/components/habits/habit-checklist";
import { TodayHero } from "@/components/today/today-hero";
import { HabitCalendar } from "@/components/today/habit-calendar";
import { MainRewardsSection } from "@/components/today/main-rewards-section";
import { MotivationSection } from "@/components/today/motivation-section";
import { TodayAddFab } from "@/components/today/today-add-fab";
import { useOfflineSync } from "@/hooks/use-offline-sync";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { cacheKeys, clearDirty, invalidateCache } from "@/lib/client-cache";
import { type AnalyticsApiResponse, type TodayResponse } from "@/lib/api-client";
import { getTodayInTimezone } from "@/lib/habits";
import { computeGamification } from "@/lib/gamification";
import {
  displayNameFromEmail,
  parseAccountSettings,
} from "@/lib/account-settings";
import { getMotivationalMessage } from "@/lib/motivation";

export default function TodayPage() {
  const { user } = useAuth();
  const { queueLog } = useOfflineSync();
  const timezone =
    user?.timezone ??
    (typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      : "UTC");
  const todayDate = getTodayInTimezone(timezone);
  const [date, setDate] = useState(todayDate);

  const cacheKey = cacheKeys.today(date);
  const { data, loading, setCachedData } = useCachedQuery<TodayResponse>(
    cacheKey,
    `/api/habits/today?date=${date}`
  );

  const { data: analytics } = useCachedQuery<AnalyticsApiResponse>(
    cacheKeys.analytics,
    "/api/analytics"
  );

  const summary = useMemo(() => {
    const habits = data?.habits ?? [];
    const total = habits.length;
    const completed = habits.filter((h) => h.log?.completed).length;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    const bestStreak = habits.reduce(
      (max, h) => Math.max(max, h.streaks.longest),
      0
    );
    return { total, completed, rate, bestStreak };
  }, [data]);

  const gamification = useMemo(
    () =>
      computeGamification({
        habitsCompleted: summary.completed,
        totalHabits: summary.total,
        completionRate: summary.rate,
        dailyStreak: data?.dailyStreak ?? 0,
        bestStreak: summary.bestStreak,
      }),
    [summary, data?.dailyStreak]
  );

  const motivation = useMemo(
    () =>
      getMotivationalMessage(
        summary.rate,
        data?.dailyStreak ?? 0,
        summary.completed
      ),
    [summary.rate, summary.completed, data?.dailyStreak]
  );

  const handleToggle = useCallback(
    async (
      habitId: string,
      completed: boolean,
      note?: string | null,
      subtasksDone?: string[]
    ) => {
      const previous = data;
      setCachedData((current) => {
        const base = current ?? data;
        if (!base) {
          return { date, habits: [] };
        }

        const habits = base.habits.map((h) =>
          h.id === habitId
            ? {
                ...h,
                log: {
                  id: h.log?.id ?? "temp",
                  habitId,
                  date,
                  completed,
                  note: note ?? h.log?.note ?? null,
                  subtasksDone: subtasksDone ?? h.log?.subtasksDone ?? [],
                },
              }
            : h
        );

        const total = habits.length;
        const done = habits.filter((h) => h.log?.completed).length;
        const rate = total === 0 ? 0 : Math.round((done / total) * 100);
        const weekDays = base.weekDays?.map((day) =>
          day.date === date ? { ...day, rate } : day
        );

        return { ...base, habits, weekDays };
      });

      try {
        await queueLog({ habitId, date, completed, note, subtasksDone });
        invalidateCache(cacheKeys.analytics);
        clearDirty(cacheKey);
      } catch (error) {
        if (previous) setCachedData(previous);
        toast.error("Could not update habit");
        throw error;
      }
    },
    [data, date, queueLog, setCachedData, cacheKey]
  );

  const account = parseAccountSettings(user?.accountSettings);
  const userName =
    account.displayName?.trim() ||
    (user?.email ? displayNameFromEmail(user.email) : "You");

  return (
    <div className="pb-28">
      <TodayHero
        userName={userName}
        avatarUrl={account.avatarDataUrl}
        dailyStreak={data?.dailyStreak ?? 0}
        weekDays={
          data?.weekDays ??
          Array.from({ length: 7 }, (_, i) => ({
            date: "",
            label: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][i] ?? "",
            rate: 0,
            isToday: false,
            isFuture: false,
          }))
        }
        selectedDate={date}
        todayDate={todayDate}
        completionRate={summary.rate}
        motivationMessage={motivation}
        onSelectDate={setDate}
      />

      <div className="mt-4 space-y-6">
        <HabitCalendar
          selectedDate={date}
          todayDate={todayDate}
          onSelectDate={setDate}
          heatmap={analytics?.heatmaps.overall}
        />

        <div className="mx-5 overflow-hidden rounded-2xl border border-gray-20 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-10 px-4 py-3">
            <div>
              <h2 className="text-base font-semibold text-gray-100">
                Today&apos;s habits
              </h2>
              <p className="mt-0.5 text-xs text-gray-80">
                {date === todayDate
                  ? format(parseISO(date), "EEEE, MMMM d")
                  : format(parseISO(date), "EEEE, MMM d")}
                {" · "}
                {summary.completed}/{summary.total} done
              </p>
            </div>
            {date !== todayDate && (
              <button
                type="button"
                onClick={() => setDate(todayDate)}
                className="shrink-0 rounded-lg bg-primary-20 px-2.5 py-1 text-xs font-medium text-primary-100 transition hover:bg-primary-30"
              >
                Back to today
              </button>
            )}
          </div>

          <HabitChecklist
            habits={data?.habits ?? []}
            date={date}
            onToggle={handleToggle}
            loading={loading && !data}
          />
        </div>

        <MainRewardsSection state={gamification} />

        <MotivationSection
          gamification={gamification}
          completionRate={summary.rate}
          dailyStreak={data?.dailyStreak ?? 0}
        />
      </div>

      <TodayAddFab />
    </div>
  );
}

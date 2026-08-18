"use client";

import { useCachedQuery } from "@/hooks/use-cached-query";
import { cacheKeys } from "@/lib/client-cache";
import { useAuth } from "@/components/providers/auth-provider";
import { ProgressRing } from "@/components/today/progress-ring";
import { getTodayInTimezone } from "@/lib/habits";
import type { TodayResponse } from "@/lib/api-client";

export default function WidgetPage() {
  const { user } = useAuth();
  const timezone =
    user?.timezone ??
    (typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
      : "UTC");
  const today = getTodayInTimezone(timezone);

  const { data } = useCachedQuery<TodayResponse>(
    cacheKeys.today(today),
    `/api/habits/today?date=${today}`
  );

  const habits = data?.habits ?? [];
  const completed = habits.filter((h) => h.log?.completed).length;
  const rate = habits.length === 0 ? 0 : Math.round((completed / habits.length) * 100);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-primary-20 to-primary-30 p-6">
      <div className="w-full max-w-[280px] rounded-3xl border border-gray-20 bg-white p-6 shadow-xl shadow-primary-30">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-gray-60">
          Alavo · Today
        </p>

        <div className="relative mx-auto mt-4 flex justify-center">
          <ProgressRing value={rate} size={160} stroke={12} active />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-100">{rate}%</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl bg-primary-20 py-2">
            <p className="text-lg font-bold text-gray-100">{completed}</p>
            <p className="text-[10px] text-gray-60">Done</p>
          </div>
          <div className="rounded-xl bg-primary-20 py-2">
            <p className="text-lg font-bold text-gray-100">
              {data?.dailyStreak ?? 0}
            </p>
            <p className="text-[10px] text-gray-60">Streak</p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-60">
          Add to Home Screen for a quick glance widget.
        </p>
      </div>
    </div>
  );
}

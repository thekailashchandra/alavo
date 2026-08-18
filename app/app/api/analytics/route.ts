import { NextRequest } from "next/server";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subDays,
} from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  calculateStreaks,
  buildHeatmap,
  completionRateForRange,
  getTodayInTimezone,
  getWeekRange,
  getWeekdayInTimezone,
  isHabitDueOnDate,
  rateToStatus,
  type HabitWithLogs,
} from "@/lib/habits";
import { jsonOk, handleApiError } from "@/lib/api";
import { getEntitlementSnapshot } from "@/lib/billing/access";

function buildOverallHeatmap(
  habits: HabitWithLogs[],
  timezone: string,
  days = 119
) {
  const today = getTodayInTimezone(timezone);
  const start = format(subDays(parseISO(today), days - 1), "yyyy-MM-dd");
  const activeHabits = habits.filter((h) => !h.archived);

  return eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(today),
  }).map((day) => {
    const date = format(day, "yyyy-MM-dd");
    let due = 0;
    let done = 0;

    for (const habit of activeHabits) {
      if (!isHabitDueOnDate(habit, date, timezone)) continue;
      due += 1;
      if (habit.logs.some((l: { date: string; completed: boolean }) => l.date === date && l.completed)) {
        done += 1;
      }
    }

    const rate = due === 0 ? 0 : Math.round((done / due) * 100);
    return {
      date,
      status: due === 0 ? ("empty" as const) : rateToStatus(rate),
      due,
      done,
      rate,
    };
  });
}

function bestDayOfWeek(habits: HabitWithLogs[], timezone: string) {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  for (const habit of habits) {
    if (habit.archived) continue;
    for (const log of habit.logs) {
      if (!log.completed) continue;
      const weekday = getWeekdayInTimezone(timezone, log.date);
      counts[weekday] += 1;
    }
  }

  let bestIndex = 0;
  for (let i = 1; i < counts.length; i += 1) {
    if (counts[i] > counts[bestIndex]) bestIndex = i;
  }

  return {
    day: bestIndex,
    dayName: dayNames[bestIndex],
    completions: counts[bestIndex],
    byDay: dayNames.map((dayName, index) => ({
      day: index,
      dayName,
      completions: counts[index],
    })),
  };
}

const ANALYTICS_LOG_DAYS = 400;

async function loadHabitsWithLogs(
  userId: string,
  timezone: string,
  lookbackDays = ANALYTICS_LOG_DAYS
): Promise<HabitWithLogs[]> {
  const today = getTodayInTimezone(timezone);
  const lookback = format(subDays(parseISO(today), lookbackDays), "yyyy-MM-dd");
  return prisma.habit.findMany({
    where: { userId },
    include: {
      logs: {
        where: { date: { gte: lookback } },
      },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const timezone = user!.timezone;
    const today = getTodayInTimezone(timezone);
    const entitlements = await getEntitlementSnapshot(user!.id);
    const historyDays = entitlements.limits.historyDays ?? ANALYTICS_LOG_DAYS;
    const heatmapDays = entitlements.features.advancedAnalytics ? 119 : historyDays;
    const habits = await loadHabitsWithLogs(user!.id, timezone, historyDays);
    const activeHabits = habits.filter((h) => !h.archived);

    const { start: weekStart, end: weekEnd } = getWeekRange(today, timezone);
    const monthStart = format(startOfMonth(parseISO(today)), "yyyy-MM-dd");
    const monthEnd = format(endOfMonth(parseISO(today)), "yyyy-MM-dd");
    const last30Start = format(subDays(parseISO(today), 29), "yyyy-MM-dd");

    const streaks = activeHabits.map((habit) => ({
      habitId: habit.id,
      name: habit.name,
      ...calculateStreaks(habit, timezone, today),
    }));

    const heatmaps = {
      overall: buildOverallHeatmap(habits, timezone, heatmapDays),
      byHabit: activeHabits.map((habit) => ({
        habitId: habit.id,
        name: habit.name,
        days: buildHeatmap(habit, timezone, heatmapDays),
      })),
    };

    const weekly = completionRateForRange(activeHabits, timezone, weekStart, weekEnd);
    const monthly = completionRateForRange(
      activeHabits,
      timezone,
      monthStart,
      monthEnd
    );
    const overall = completionRateForRange(
      activeHabits,
      timezone,
      last30Start,
      today
    );

    return jsonOk({
      streaks,
      heatmaps,
      rates: {
        weekly,
        monthly,
        overall: {
          ...overall,
          range: { start: last30Start, end: today },
        },
      },
      bestDayOfWeek: bestDayOfWeek(habits, timezone),
      overallCompletionPercent: overall.rate,
      historyDays,
      advancedAnalytics: entitlements.features.advancedAnalytics,
      coachingUnlocked: entitlements.features.aiCoaching,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

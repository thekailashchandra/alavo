import { format, parseISO, subDays } from "date-fns";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  calculateStreaks,
  calculateDailyStreak,
  getTodayInTimezone,
  getWeekDaySummaries,
  isHabitDueOnDate,
  weeklyCompletions,
  type HabitWithLogs,
} from "@/lib/habits";
import { jsonOk, handleApiError } from "@/lib/api";

const LOG_LOOKBACK_DAYS = 400;

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ?? getTodayInTimezone(user!.timezone);
    const lookback = format(subDays(parseISO(date), LOG_LOOKBACK_DAYS), "yyyy-MM-dd");

    const habits: HabitWithLogs[] = await prisma.habit.findMany({
      where: { userId: user!.id, archived: false },
      include: {
        logs: {
          where: { date: { gte: lookback } },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    const today = getTodayInTimezone(user!.timezone);
    const dueHabits = habits
      .filter((habit) => isHabitDueOnDate(habit, date, user!.timezone))
      .map((habit) => {
        const { logs, ...habitFields } = habit;
        const log = logs.find((l: { date: string }) => l.date === date) ?? null;
        const streaks = calculateStreaks(habit, user!.timezone, today);
        const weeklyProgress =
          habit.frequencyType === "TIMES_PER_WEEK"
            ? {
                completed: weeklyCompletions(habit, date, user!.timezone),
                target: habit.timesPerWeek ?? 1,
              }
            : null;
        return {
          ...habitFields,
          subtasks: (habit.subtasks as { id: string; title: string }[] | null) ?? [],
          log: log
            ? {
                id: log.id,
                habitId: log.habitId,
                date: log.date,
                completed: log.completed,
                note: log.note,
                subtasksDone: (log.subtasksDone as string[] | null) ?? [],
              }
            : null,
          streaks,
          weeklyProgress,
        };
      });

    return jsonOk({
      date,
      habits: dueHabits,
      weekDays: getWeekDaySummaries(habits, date, user!.timezone, today),
      dailyStreak: calculateDailyStreak(habits, user!.timezone, today),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

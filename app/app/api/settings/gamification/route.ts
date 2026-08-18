import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  calculateDailyStreak,
  calculateStreaks,
  getTodayInTimezone,
  type HabitWithLogs,
} from "@/lib/habits";
import { computeGamification } from "@/lib/gamification";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const today = getTodayInTimezone(user!.timezone);
    const habits: HabitWithLogs[] = await prisma.habit.findMany({
      where: { userId: user!.id, archived: false },
      include: { logs: true },
    });

    const todayLogs = habits.flatMap((h) =>
      h.logs.filter((l) => l.date === today && l.completed)
    );
    const dueToday = habits.length;
    const habitsCompleted = todayLogs.length;
    const completionRate =
      dueToday > 0 ? Math.round((habitsCompleted / dueToday) * 100) : 0;
    const dailyStreak = calculateDailyStreak(habits, user!.timezone, today);

    let bestStreak = dailyStreak;
    for (const habit of habits) {
      const streaks = calculateStreaks(habit, user!.timezone, today);
      bestStreak = Math.max(bestStreak, streaks.current, streaks.longest);
    }

    const totalCompleted = habits.reduce(
      (sum, h) => sum + h.logs.filter((l) => l.completed).length,
      0
    );

    return jsonOk({
      gamification: computeGamification({
        habitsCompleted,
        totalHabits: dueToday,
        completionRate,
        dailyStreak,
        bestStreak,
      }),
      stats: {
        totalCompleted,
        dailyStreak,
        completionRate,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

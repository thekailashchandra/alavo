import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import {
  calculateStreaks,
  getTodayInTimezone,
  isHabitDueOnDate,
  type HabitWithLogs,
} from "@/lib/habits";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ?? getTodayInTimezone(user!.timezone);

    const habits: HabitWithLogs[] = await prisma.habit.findMany({
      where: { userId: user!.id, archived: false },
      include: {
        logs: true,
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
        return {
          ...habitFields,
          log,
          streaks,
        };
      });

    return jsonOk({ date, habits: dueHabits });
  } catch (error) {
    return handleApiError(error);
  }
}

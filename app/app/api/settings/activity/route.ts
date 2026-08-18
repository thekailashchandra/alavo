import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getTodayInTimezone } from "@/lib/habits";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") ?? "all";
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
    const today = getTodayInTimezone(user!.timezone);

    const habits = await prisma.habit.findMany({
      where: { userId: user!.id, archived: false },
      select: { id: true, name: true, icon: true },
    });
    const habitMap = new Map(habits.map((h) => [h.id, h]));

    const logs = await prisma.habitLog.findMany({
      where: {
        habitId: { in: habits.map((h) => h.id) },
        ...(filter === "completed"
          ? { completed: true }
          : filter === "incomplete"
            ? { completed: false, date: { lte: today } }
            : {}),
      },
      orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
      take: limit,
    });

    const items = logs
      .map((log) => {
        const habit = habitMap.get(log.habitId);
        if (!habit) return null;
        return {
          id: log.id,
          habitId: log.habitId,
          habitName: habit.name,
          habitIcon: habit.icon,
          date: log.date,
          completed: log.completed,
          note: log.note,
        };
      })
      .filter(Boolean);

    const completedCount = await prisma.habitLog.count({
      where: {
        habitId: { in: habits.map((h) => h.id) },
        completed: true,
      },
    });

    const incompleteCount = await prisma.habitLog.count({
      where: {
        habitId: { in: habits.map((h) => h.id) },
        completed: false,
        date: { lte: today },
      },
    });

    return jsonOk({
      items,
      stats: { completedCount, incompleteCount },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

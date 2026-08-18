import { format, parseISO, subDays } from "date-fns";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";
import { requireFeature } from "@/lib/billing/access";
import { buildCoachingInsights } from "@/lib/billing/coaching";
import { getTodayInTimezone, type HabitWithLogs } from "@/lib/habits";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const gated = await requireFeature(user!.id, "aiCoaching");
    if (gated.error) {
      return jsonOk({
        locked: true,
        insights: [],
        feature: "aiCoaching",
      });
    }

    const today = getTodayInTimezone(user!.timezone);
    const lookback = format(subDays(parseISO(today), 45), "yyyy-MM-dd");
    const habits = (await prisma.habit.findMany({
      where: { userId: user!.id },
      include: { logs: { where: { date: { gte: lookback } } } },
      orderBy: { sortOrder: "asc" },
    })) as HabitWithLogs[];

    return jsonOk({
      locked: false,
      insights: buildCoachingInsights(habits, user!.timezone),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

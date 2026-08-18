import { NextRequest } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { habitLogSchema } from "@/lib/validations";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

const batchLogsSchema = z.object({
  logs: z.array(habitLogSchema).min(1),
});

async function upsertLog(
  userId: string,
  entry: z.infer<typeof habitLogSchema>
) {
  const habit = await prisma.habit.findFirst({
    where: { id: entry.habitId, userId },
  });
  if (!habit) {
    throw new Error(`Habit not found: ${entry.habitId}`);
  }

  return prisma.habitLog.upsert({
    where: {
      habitId_date: {
        habitId: entry.habitId,
        date: entry.date,
      },
    },
    create: {
      habitId: entry.habitId,
      date: entry.date,
      completed: entry.completed,
      note: entry.note ?? null,
      subtasksDone: entry.subtasksDone?.length ? entry.subtasksDone : Prisma.DbNull,
    },
    update: {
      completed: entry.completed,
      note: entry.note ?? null,
      subtasksDone: entry.subtasksDone?.length ? entry.subtasksDone : Prisma.DbNull,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const habits = await prisma.habit.findMany({
      where: { userId: user!.id },
      select: { id: true },
    });
    const habitIds = habits.map((h) => h.id);

    if (habitIds.length === 0) {
      return jsonOk({ logs: [] });
    }

    const dateFilter =
      date != null
        ? date
        : from && to
          ? { gte: from, lte: to }
          : from
            ? { gte: from }
            : to
              ? { lte: to }
              : undefined;

    const logs = await prisma.habitLog.findMany({
      where: {
        habitId: { in: habitIds },
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      orderBy: [{ date: "desc" }, { updatedAt: "desc" }],
    });

    return jsonOk({ logs });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = await req.json();

    if (Array.isArray(body.logs)) {
      const { logs } = batchLogsSchema.parse(body);
      const results = await prisma.$transaction(async (tx) => {
        const saved = [];
        for (const entry of logs) {
          const habit = await tx.habit.findFirst({
            where: { id: entry.habitId, userId: user!.id },
          });
          if (!habit) {
            throw new Error(`Habit not found: ${entry.habitId}`);
          }
          saved.push(
            await tx.habitLog.upsert({
              where: {
                habitId_date: {
                  habitId: entry.habitId,
                  date: entry.date,
                },
              },
              create: {
                habitId: entry.habitId,
                date: entry.date,
                completed: entry.completed,
                note: entry.note ?? null,
                subtasksDone: entry.subtasksDone?.length
                  ? entry.subtasksDone
                  : Prisma.DbNull,
              },
              update: {
                completed: entry.completed,
                note: entry.note ?? null,
                subtasksDone: entry.subtasksDone?.length
                  ? entry.subtasksDone
                  : Prisma.DbNull,
              },
            })
          );
        }
        return saved;
      });
      return jsonOk({ logs: results });
    }

    const entry = habitLogSchema.parse(body);
    const log = await upsertLog(user!.id, entry);
    return jsonOk({ log });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Habit not found")) {
      return jsonError("Habit not found", 404);
    }
    return handleApiError(error);
  }
}

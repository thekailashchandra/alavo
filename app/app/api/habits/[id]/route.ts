import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { updateHabitSchema } from "@/lib/validations";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { getEntitlementSnapshot } from "@/lib/billing/access";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { id } = await context.params;
    const existing = await prisma.habit.findFirst({
      where: { id, userId: user!.id },
    });
    if (!existing) {
      return jsonError("Habit not found", 404);
    }

    const body = await req.json();
    const data = updateHabitSchema.parse(body);

    if (data.archived === false && existing.archived) {
      const entitlements = await getEntitlementSnapshot(user!.id);
      if (entitlements.limits.maxHabits != null) {
        const activeCount = await prisma.habit.count({
          where: { userId: user!.id, archived: false },
        });
        if (activeCount >= entitlements.limits.maxHabits) {
          return jsonError(
            `Free accounts can track up to ${entitlements.limits.maxHabits} active habits. Upgrade to restore this habit.`,
            402,
            { code: "PAYWALL", feature: "unlimitedHabits" }
          );
        }
      }
    }

    const habit = await prisma.habit.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.frequencyType !== undefined && {
          frequencyType: data.frequencyType,
        }),
        ...(data.weekdays !== undefined && { weekdays: data.weekdays }),
        ...(data.timesPerWeek !== undefined && {
          timesPerWeek: data.timesPerWeek,
        }),
        ...(data.targetTime !== undefined && { targetTime: data.targetTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime }),
        ...(data.durationMinutes !== undefined && {
          durationMinutes: data.durationMinutes,
        }),
        ...(data.reminderEnabled !== undefined && {
          reminderEnabled: data.reminderEnabled,
        }),
        ...(data.subtasks !== undefined && {
          subtasks: data.subtasks.length
            ? data.subtasks
            : Prisma.DbNull,
        }),
        ...(data.archived !== undefined && { archived: data.archived }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      },
    });

    return jsonOk({ habit });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { id } = await context.params;
    const existing = await prisma.habit.findFirst({
      where: { id, userId: user!.id },
    });
    if (!existing) {
      return jsonError("Habit not found", 404);
    }

    await prisma.habit.delete({ where: { id } });

    return jsonOk({ message: "Habit deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createHabitSchema } from "@/lib/validations";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { getEntitlementSnapshot } from "@/lib/billing/access";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const archivedParam = searchParams.get("archived");

    const where: { userId: string; archived?: boolean } = { userId: user!.id };
    if (archivedParam === "true") {
      where.archived = true;
    } else if (archivedParam === "false") {
      where.archived = false;
    }

    const habits = await prisma.habit.findMany({
      where,
      orderBy: { sortOrder: "asc" },
    });

    return jsonOk({ habits });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const data = createHabitSchema.parse(body);

    const activeCount = await prisma.habit.count({
      where: { userId: user!.id, archived: false },
    });
    const entitlements = await getEntitlementSnapshot(user!.id);
    if (
      entitlements.limits.maxHabits != null &&
      activeCount >= entitlements.limits.maxHabits
    ) {
      return jsonError(
        `Free accounts can track up to ${entitlements.limits.maxHabits} active habits. Upgrade for unlimited habits.`,
        402,
        { code: "PAYWALL", feature: "unlimitedHabits" }
      );
    }

    const maxSort = await prisma.habit.aggregate({
      where: { userId: user!.id },
      _max: { sortOrder: true },
    });

    const habit = await prisma.habit.create({
      data: {
        userId: user!.id,
        name: data.name,
        icon: data.icon,
        frequencyType: data.frequencyType,
        weekdays: data.weekdays,
        timesPerWeek:
          data.frequencyType === "TIMES_PER_WEEK" ? data.timesPerWeek : null,
        targetTime: data.targetTime ?? null,
        endTime: data.endTime ?? null,
        durationMinutes: data.durationMinutes ?? null,
        reminderEnabled: data.reminderEnabled,
        subtasks: data.subtasks?.length ? data.subtasks : undefined,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    });

    return jsonOk({ habit }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { reorderHabitsSchema } from "@/lib/validations";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const body = await req.json();
    const { orderedIds } = reorderHabitsSchema.parse(body);

    const habits = await prisma.habit.findMany({
      where: { userId: user!.id, id: { in: orderedIds } },
      select: { id: true },
    });

    if (habits.length !== orderedIds.length) {
      return jsonError("One or more habits not found", 400);
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.habit.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    const updated = await prisma.habit.findMany({
      where: { userId: user!.id },
      orderBy: { sortOrder: "asc" },
    });

    return jsonOk({ habits: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

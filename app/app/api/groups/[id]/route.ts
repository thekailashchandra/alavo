import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { requireFeature } from "@/lib/billing/access";

type RouteContext = { params: Promise<{ id: string }> };

const challengeSchema = z.object({
  name: z.string().trim().min(2).max(48),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

async function requireMembership(groupId: string, userId: string) {
  return prisma.habitGroupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;
    const gated = await requireFeature(user!.id, "teamGroups");
    if (gated.error) return gated.error;

    const { id } = await context.params;
    const membership = await requireMembership(id, user!.id);
    if (!membership || membership.role !== "OWNER") {
      return jsonError("Only the group owner can start a challenge", 403);
    }

    const data = challengeSchema.parse(await req.json());
    if (data.endDate < data.startDate) {
      return jsonError("End date must be after start date", 400);
    }

    const challenge = await prisma.habitGroupChallenge.create({
      data: { groupId: id, ...data },
    });
    return jsonOk({ challenge }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;
    const { id } = await context.params;
    const membership = await requireMembership(id, user!.id);
    if (!membership) return jsonError("Not in this group", 404);

    if (membership.role === "OWNER") {
      await prisma.habitGroup.delete({ where: { id } });
      return jsonOk({ deleted: true });
    }

    await prisma.habitGroupMember.delete({
      where: { groupId_userId: { groupId: id, userId: user!.id } },
    });
    return jsonOk({ left: true });
  } catch (error) {
    return handleApiError(error);
  }
}

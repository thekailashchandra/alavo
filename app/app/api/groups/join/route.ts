import { NextRequest } from "next/server";
import { z } from "zod";
import { TEAM_SEAT_LIMIT } from "@alavo/brand";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";

const joinSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .min(6)
    .max(16)
    .transform((value) => value.toUpperCase()),
});

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const { inviteCode } = joinSchema.parse(await req.json());
    const group = await prisma.habitGroup.findUnique({
      where: { inviteCode },
      include: { _count: { select: { members: true } } },
    });
    if (!group) return jsonError("Invite code not found", 404);
    if (group._count.members >= TEAM_SEAT_LIMIT) {
      return jsonError(`This group is full (${TEAM_SEAT_LIMIT} seats).`, 400);
    }

    await prisma.habitGroupMember.upsert({
      where: { groupId_userId: { groupId: group.id, userId: user!.id } },
      update: {},
      create: { groupId: group.id, userId: user!.id, role: "MEMBER" },
    });

    return jsonOk({ groupId: group.id, name: group.name });
  } catch (error) {
    return handleApiError(error);
  }
}

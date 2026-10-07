import { NextRequest } from "next/server";
import { z } from "zod";
import { TEAM_SEAT_LIMIT } from "@alavo/brand";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { enforceRateLimit } from "@/lib/with-rate-limit";

const joinSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .min(6)
    .max(16)
    .transform((value) => value.toUpperCase()),
});

/**
 * Joining a group does not change the member's own plan row.
 * If the owner has an active Team plan, existing entitlement checks
 * still let members use that owner's shared seats. That is the paid
 * team product, and it is unchanged for accounts that can already
 * open the workspace.
 * New unpaid Cloud accounts cannot call this route, so an invite code
 * alone cannot unlock Alavo Cloud.
 */
export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, "groups:join", 8, 15 * 60_000);
    if (limited) return limited;

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

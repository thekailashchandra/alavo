import { randomBytes } from "crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { TEAM_SEAT_LIMIT } from "@alavo/brand";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api";
import { getEntitlementSnapshot, requireFeature } from "@/lib/billing/access";
import {
  completionRateForRange,
  getTodayInTimezone,
  type HabitWithLogs,
} from "@/lib/habits";
import { format, parseISO, subDays } from "date-fns";

const createGroupSchema = z.object({
  name: z.string().trim().min(2).max(48),
});

function inviteCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

async function memberStats(userId: string, timezone: string, start: string, end: string) {
  const habits = (await prisma.habit.findMany({
    where: { userId, archived: false },
    include: { logs: { where: { date: { gte: start, lte: end } } } },
  })) as HabitWithLogs[];
  return completionRateForRange(habits, timezone, start, end);
}

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const entitlements = await getEntitlementSnapshot(user!.id);
    const memberships = await prisma.habitGroupMember.findMany({
      where: { userId: user!.id },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: { select: { id: true, email: true, timezone: true } },
              },
            },
            challenges: { orderBy: { createdAt: "desc" }, take: 3 },
          },
        },
      },
    });

    const today = getTodayInTimezone(user!.timezone);
    const weekStart = format(subDays(parseISO(today), 6), "yyyy-MM-dd");

    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const leaderboard = await Promise.all(
          membership.group.members.map(async (member) => {
            const rate = await memberStats(
              member.userId,
              member.user.timezone,
              weekStart,
              today
            );
            return {
              userId: member.userId,
              email: member.user.email,
              role: member.role,
              rate: rate.rate,
              done: rate.done,
              due: rate.due,
            };
          })
        );
        leaderboard.sort((a, b) => b.rate - a.rate);
        return {
          id: membership.group.id,
          name: membership.group.name,
          inviteCode: membership.role === "OWNER" ? membership.group.inviteCode : undefined,
          role: membership.role,
          memberCount: membership.group.members.length,
          seatLimit: TEAM_SEAT_LIMIT,
          challenges: membership.group.challenges,
          leaderboard,
        };
      })
    );

    return jsonOk({
      locked: !entitlements.features.teamGroups,
      groups,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth(req);
    if (error) return error;

    const gated = await requireFeature(user!.id, "teamGroups");
    if (gated.error) return gated.error;

    const { name } = createGroupSchema.parse(await req.json());
    const group = await prisma.habitGroup.create({
      data: {
        name,
        ownerId: user!.id,
        inviteCode: inviteCode(),
        members: {
          create: { userId: user!.id, role: "OWNER" },
        },
      },
    });

    return jsonOk({ group }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

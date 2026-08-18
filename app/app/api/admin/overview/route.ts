import { NextRequest } from "next/server";
import { startOfMonth } from "date-fns";
import { requireAdmin } from "@/lib/admin";
import { jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    const now = new Date();
    const monthStart = startOfMonth(now);

    const [
      totalUsers,
      verifiedUsers,
      lifetimeUsers,
      paidPro,
      paidTeam,
      trialUsers,
      paidRevenue,
      monthRevenue,
      paymentCount,
      couponCount,
      redemptionCount,
      habitCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { emailVerified: { not: null } } }),
      prisma.user.count({ where: { lifetime: true } }),
      prisma.user.count({
        where: {
          plan: "PRO",
          OR: [{ lifetime: true }, { planExpiresAt: { gt: now } }],
        },
      }),
      prisma.user.count({
        where: { plan: "TEAM", OR: [{ lifetime: true }, { planExpiresAt: { gt: now } }] },
      }),
      prisma.user.count({
        where: {
          lifetime: false,
          trialEndsAt: { gt: now },
          OR: [{ plan: "FREE" }, { planExpiresAt: { lte: now } }, { planExpiresAt: null }],
        },
      }),
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amountPaise: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: { status: "PAID", paidAt: { gte: monthStart } },
        _sum: { amountPaise: true },
      }),
      prisma.payment.count({ where: { status: "PAID" } }),
      prisma.coupon.count(),
      prisma.couponRedemption.count(),
      prisma.habit.count({ where: { archived: false } }),
    ]);

    return jsonOk({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        trial: trialUsers,
        paid: paidPro + paidTeam,
        lifetime: lifetimeUsers,
        pro: paidPro,
        team: paidTeam,
      },
      revenue: {
        totalPaise: paidRevenue._sum.amountPaise ?? 0,
        monthPaise: monthRevenue._sum.amountPaise ?? 0,
        payments: paymentCount,
      },
      coupons: { total: couponCount, redemptions: redemptionCount },
      habits: habitCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

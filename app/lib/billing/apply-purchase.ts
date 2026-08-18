import { BILLING_CATALOG, type BillingSku } from "@alavo/brand";
import { prisma } from "@/lib/prisma";
import { accessUntil } from "@/lib/billing/entitlements";
import type { PlanCode } from "@prisma/client";

const PLAN_RANK: Record<PlanCode, number> = {
  FREE: 0,
  PRO: 1,
  TEAM: 2,
};

function planForSku(sku: BillingSku): PlanCode | null {
  if (sku === "TEAM_MONTHLY") return "TEAM";
  if (sku === "PRO_MONTHLY" || sku === "PRO_YEARLY" || sku === "LIFETIME") return "PRO";
  return null;
}

export async function applyPaidSku(userId: string, sku: BillingSku) {
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      planExpiresAt: true,
      lifetime: true,
    },
  });
  if (!user) throw new Error("User not found");

  if (sku.startsWith("ADDON_")) {
    await prisma.userAddon.upsert({
      where: { userId_sku: { userId, sku } },
      update: { purchasedAt: now, expiresAt: null },
      create: { userId, sku, purchasedAt: now, expiresAt: null },
    });
    return;
  }

  if (sku === "LIFETIME") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        lifetime: true,
        plan: user.plan === "TEAM" ? "TEAM" : "PRO",
        planExpiresAt: null,
      },
    });
    return;
  }

  const nextPlan = planForSku(sku);
  if (!nextPlan) return;

  const base =
    user.planExpiresAt && user.planExpiresAt.getTime() > now.getTime()
      ? user.planExpiresAt
      : now;
  const until = accessUntil(sku, base);
  const keepTeam = user.plan === "TEAM" && PLAN_RANK[user.plan] >= PLAN_RANK[nextPlan];

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: keepTeam ? "TEAM" : nextPlan,
      planExpiresAt: user.lifetime ? null : until,
    },
  });
}

export async function setUserFree(userId: string) {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        plan: "FREE",
        planExpiresAt: null,
        lifetime: false,
        trialEndsAt: new Date(),
      },
    }),
    prisma.userAddon.deleteMany({ where: { userId } }),
  ]);
}

export function amountPaiseForSku(sku: BillingSku) {
  return BILLING_CATALOG[sku].amountInr * 100;
}

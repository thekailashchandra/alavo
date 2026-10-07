import { isGrandfatheredCloudUser } from "@/lib/billing/cloud-access";
import { applyDeploymentEntitlements } from "@/lib/deployment-mode";
import { prisma } from "@/lib/prisma";
import {
  resolveEntitlements,
  trialWindow,
  type EntitlementSnapshot,
  type FeatureKey,
  featureLabel,
} from "@/lib/billing/entitlements";
import { jsonError } from "@/lib/api";
import type { BillingSku } from "@alavo/brand";

async function isTeamCovered(userId: string, now: Date) {
  const memberships = await prisma.habitGroupMember.findMany({
    where: { userId },
    select: {
      group: {
        select: {
          owner: {
            select: {
              id: true,
              plan: true,
              planExpiresAt: true,
              lifetime: true,
            },
          },
        },
      },
    },
  });

  return memberships.some(({ group }) => {
    const owner = group.owner;
    if (owner.plan !== "TEAM") return false;
    if (owner.lifetime) return true;
    return !owner.planExpiresAt || owner.planExpiresAt.getTime() > now.getTime();
  });
}

export async function ensureTrial(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialStartedAt: true, createdAt: true },
  });
  if (!user || user.trialStartedAt) return;
  if (!isGrandfatheredCloudUser(user.createdAt)) return;
  const window = trialWindow();
  await prisma.user.update({
    where: { id: userId },
    data: window,
  });
}

export async function getEntitlementSnapshot(
  userId: string
): Promise<EntitlementSnapshot> {
  await ensureTrial(userId);
  const now = new Date();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      planExpiresAt: true,
      lifetime: true,
      trialStartedAt: true,
      trialEndsAt: true,
      addons: { select: { sku: true, expiresAt: true } },
    },
  });

  if (!user) {
    return applyDeploymentEntitlements(
      resolveEntitlements({
        plan: "FREE",
        planExpiresAt: null,
        lifetime: false,
        trialStartedAt: null,
        trialEndsAt: null,
        addons: [],
        teamCovered: false,
      })
    );
  }

  const teamCovered = await isTeamCovered(userId, now);

  return applyDeploymentEntitlements(
    resolveEntitlements(
      {
        plan: user.plan,
        planExpiresAt: user.planExpiresAt,
        lifetime: user.lifetime,
        trialStartedAt: user.trialStartedAt,
        trialEndsAt: user.trialEndsAt,
        addons: user.addons.map((addon) => ({
          sku: addon.sku as BillingSku,
          expiresAt: addon.expiresAt,
        })),
        teamCovered,
      },
      now
    )
  );
}

export async function requireFeature(userId: string, feature: FeatureKey) {
  const entitlements = await getEntitlementSnapshot(userId);
  if (entitlements.features[feature]) {
    return { entitlements, error: null as Response | null };
  }
  return {
    entitlements,
    error: jsonError(`${featureLabel(feature)} is included in an upgrade.`, 402, {
      code: "PAYWALL",
      feature,
    }),
  };
}

export async function logLookbackDays(userId: string, fallback: number) {
  const entitlements = await getEntitlementSnapshot(userId);
  if (entitlements.limits.historyDays == null) return fallback;
  return Math.min(fallback, entitlements.limits.historyDays);
}

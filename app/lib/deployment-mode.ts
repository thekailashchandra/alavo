import type { EntitlementSnapshot } from "@/lib/billing/entitlements";

export type DeploymentMode = "cloud" | "self-hosted";

/** Cloud is the default so existing hosted installs keep current billing behavior. */
export function deploymentMode(): DeploymentMode {
  const raw = (process.env.DEPLOYMENT_MODE || "cloud")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  if (raw === "self-hosted") return "self-hosted";
  return "cloud";
}

export function isSelfHosted() {
  return deploymentMode() === "self-hosted";
}

const FULL_CORE: EntitlementSnapshot["features"] = {
  unlimitedHabits: true,
  advancedAnalytics: true,
  fullHistory: true,
  aiCoaching: true,
  advancedExport: true,
  customNotifications: true,
  calendarSync: true,
  teamGroups: true,
};

/**
 * Self-hosted installs get the complete core product.
 * Cloud installs keep the snapshot produced from the user's plan.
 */
export function applyDeploymentEntitlements(
  snapshot: EntitlementSnapshot
): EntitlementSnapshot {
  if (!isSelfHosted()) return snapshot;
  return {
    ...snapshot,
    displayPlan: snapshot.lifetime ? "Lifetime" : "Self-hosted",
    features: FULL_CORE,
    limits: { maxHabits: null, historyDays: null },
  };
}

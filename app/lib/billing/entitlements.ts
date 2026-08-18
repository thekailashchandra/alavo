import { addDays } from "date-fns";
import {
  BILLING_CATALOG,
  FREE_HABIT_LIMIT,
  FREE_HISTORY_DAYS,
  TRIAL_DAYS,
  type BillingSku,
  type PlanCode,
} from "@alavo/brand";

export type FeatureKey =
  | "unlimitedHabits"
  | "advancedAnalytics"
  | "fullHistory"
  | "aiCoaching"
  | "advancedExport"
  | "customNotifications"
  | "calendarSync"
  | "teamGroups";

export type BillingStatus = "free" | "trial" | "active" | "lifetime" | "expired";

export type EntitlementSnapshot = {
  plan: PlanCode;
  displayPlan: string;
  status: BillingStatus;
  trialEndsAt: string | null;
  planExpiresAt: string | null;
  lifetime: boolean;
  features: Record<FeatureKey, boolean>;
  limits: {
    maxHabits: number | null;
    historyDays: number | null;
  };
  addons: BillingSku[];
};

export type BillingUserInput = {
  plan: PlanCode;
  planExpiresAt: Date | null;
  lifetime: boolean;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  addons: { sku: BillingSku; expiresAt: Date | null }[];
  teamCovered: boolean;
};

export function isSku(value: string): value is BillingSku {
  return value in BILLING_CATALOG;
}

function addonActive(
  addons: BillingUserInput["addons"],
  sku: BillingSku,
  now: Date
) {
  return addons.some(
    (addon) =>
      addon.sku === sku && (!addon.expiresAt || addon.expiresAt.getTime() > now.getTime())
  );
}

function paidPlanActive(input: BillingUserInput, now: Date): PlanCode | null {
  const unexpired =
    !input.planExpiresAt || input.planExpiresAt.getTime() > now.getTime();
  if (input.plan === "TEAM" && unexpired) return "TEAM";
  if (input.lifetime) return "PRO";
  if (input.plan === "PRO" && unexpired) return "PRO";
  return null;
}

function trialActive(input: BillingUserInput, now: Date) {
  return Boolean(
    input.trialEndsAt && input.trialEndsAt.getTime() > now.getTime()
  );
}

export function resolveEntitlements(
  input: BillingUserInput,
  now = new Date()
): EntitlementSnapshot {
  const paid = paidPlanActive(input, now);
  const onTrial = !paid && !input.teamCovered && trialActive(input, now);
  const effective: PlanCode = input.teamCovered
    ? "TEAM"
    : paid === "TEAM"
      ? "TEAM"
      : paid === "PRO" || onTrial
        ? "PRO"
        : "FREE";

  const pro = effective === "PRO" || effective === "TEAM";
  const addons = input.addons
    .filter((addon) => !addon.expiresAt || addon.expiresAt.getTime() > now.getTime())
    .map((addon) => addon.sku);

  const features: Record<FeatureKey, boolean> = {
    unlimitedHabits: pro,
    advancedAnalytics: pro,
    fullHistory: pro,
    aiCoaching: addonActive(input.addons, "ADDON_AI_COACHING", now),
    advancedExport: addonActive(input.addons, "ADDON_EXPORT", now),
    customNotifications: addonActive(input.addons, "ADDON_NOTIFICATIONS", now),
    calendarSync: addonActive(input.addons, "ADDON_NOTIFICATIONS", now),
    teamGroups: effective === "TEAM",
  };

  let status: BillingStatus = "free";
  if (input.lifetime) status = "lifetime";
  else if (paid || input.teamCovered) status = "active";
  else if (onTrial) status = "trial";
  else if (input.plan !== "FREE" && input.planExpiresAt) status = "expired";

  let displayPlan = "Free";
  if (status === "lifetime") displayPlan = "Lifetime Pro";
  else if (effective === "TEAM") displayPlan = "Team";
  else if (onTrial) displayPlan = "Pro trial";
  else if (effective === "PRO") displayPlan = "Pro";
  else if (status === "expired") displayPlan = "Free";

  return {
    plan: effective,
    displayPlan,
    status,
    trialEndsAt: input.trialEndsAt?.toISOString() ?? null,
    planExpiresAt: input.lifetime ? null : input.planExpiresAt?.toISOString() ?? null,
    lifetime: input.lifetime,
    features,
    limits: {
      maxHabits: features.unlimitedHabits ? null : FREE_HABIT_LIMIT,
      historyDays: features.fullHistory ? null : FREE_HISTORY_DAYS,
    },
    addons,
  };
}

export function trialWindow(from = new Date()) {
  return {
    trialStartedAt: from,
    trialEndsAt: addDays(from, TRIAL_DAYS),
  };
}

export function accessUntil(sku: BillingSku, from: Date) {
  const days = BILLING_CATALOG[sku].accessDays;
  if (days == null) return null;
  return addDays(from, days);
}

export function recommendedSkuForFeature(feature: FeatureKey): BillingSku {
  if (feature === "teamGroups") return "TEAM_MONTHLY";
  if (feature === "aiCoaching") return "ADDON_AI_COACHING";
  if (feature === "advancedExport") return "ADDON_EXPORT";
  if (feature === "customNotifications" || feature === "calendarSync") {
    return "ADDON_NOTIFICATIONS";
  }
  return "LIFETIME";
}

export function featureLabel(feature: FeatureKey) {
  const labels: Record<FeatureKey, string> = {
    unlimitedHabits: "Unlimited habits",
    advancedAnalytics: "Advanced analytics",
    fullHistory: "Full history",
    aiCoaching: "AI coaching",
    advancedExport: "Advanced export",
    customNotifications: "Custom notification schedules",
    calendarSync: "Calendar sync",
    teamGroups: "Team & family groups",
  };
  return labels[feature];
}

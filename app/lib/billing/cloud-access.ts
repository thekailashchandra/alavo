import type { BillingStatus } from "@/lib/billing/entitlements";

/**
 * When this is missing or invalid, every Cloud account keeps today's rules.
 * Set it only when new hosted signups must pay.
 */
export function cloudPaidSignupCutoff(
  raw = process.env.CLOUD_PAID_SIGNUP_DATE
): Date | null {
  const value = raw?.trim();
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

/** Accounts created before the cutoff keep their current entitlements. */
export function isGrandfatheredCloudUser(
  createdAt: Date,
  cutoff = cloudPaidSignupCutoff()
) {
  if (!cutoff) return true;
  return createdAt.getTime() < cutoff.getTime();
}

export function shouldStartLegacyTrial(
  createdAt: Date,
  cutoff = cloudPaidSignupCutoff()
) {
  return isGrandfatheredCloudUser(createdAt, cutoff);
}

export type CloudWorkspaceInput = {
  createdAt: Date;
  lifetime: boolean;
  status: BillingStatus;
  selfHosted?: boolean;
  cutoff?: Date | null;
};

/**
 * Self-hosted installs always enter the app.
 * Grandfathered Cloud accounts enter the app under their existing plan limits.
 * Newer Cloud accounts need an active paid plan or lifetime unlock.
 * A legacy trial is not a paid plan.
 */
export function hasCloudWorkspaceAccess(input: CloudWorkspaceInput) {
  if (input.selfHosted) return true;
  const cutoff =
    input.cutoff === undefined ? cloudPaidSignupCutoff() : input.cutoff;
  if (isGrandfatheredCloudUser(input.createdAt, cutoff)) return true;
  return input.lifetime || input.status === "active" || input.status === "lifetime";
}

const WORKSPACE_EXEMPT_API = [
  "/api/auth",
  "/api/billing",
  "/api/health",
  "/api/geo",
  "/api/admin",
  "/api/cron",
  "/api/settings/account",
  "/api/settings/profile",
  "/api/settings/consent",
  "/api/settings/export",
];

export function workspaceApiRequiresCloudPayment(url: string) {
  let pathname = url;
  try {
    pathname = new URL(url).pathname;
  } catch {
    pathname = url;
  }
  if (!pathname.startsWith("/api/")) return false;
  return !WORKSPACE_EXEMPT_API.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

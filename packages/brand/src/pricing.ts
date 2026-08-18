/** Shared INR catalog for Alavo freemium billing (v1 Payment Links). */

export const TRIAL_DAYS = 14;
export const FREE_HABIT_LIMIT = 5;
export const FREE_HISTORY_DAYS = 30;
export const TEAM_SEAT_LIMIT = 5;

export const BILLING_SKUS = [
  "PRO_MONTHLY",
  "PRO_YEARLY",
  "LIFETIME",
  "TEAM_MONTHLY",
  "ADDON_AI_COACHING",
  "ADDON_EXPORT",
  "ADDON_NOTIFICATIONS",
] as const;

export type BillingSku = (typeof BILLING_SKUS)[number];

export type PlanCode = "FREE" | "PRO" | "TEAM";

export type BillingCatalogItem = {
  sku: BillingSku;
  name: string;
  tagline: string;
  amountInr: number;
  interval: "month" | "year" | "once";
  accessDays: number | null;
  recommended?: boolean;
};

export const BILLING_CATALOG: Record<BillingSku, BillingCatalogItem> = {
  PRO_MONTHLY: {
    sku: "PRO_MONTHLY",
    name: "Pro monthly",
    tagline: "Unlimited habits, full history, and advanced analytics",
    amountInr: 99,
    interval: "month",
    accessDays: 30,
  },
  PRO_YEARLY: {
    sku: "PRO_YEARLY",
    name: "Pro yearly",
    tagline: "Two months free vs monthly — best for solo tracking",
    amountInr: 799,
    interval: "year",
    accessDays: 365,
    recommended: true,
  },
  LIFETIME: {
    sku: "LIFETIME",
    name: "Lifetime unlock",
    tagline: "Pay once for Pro forever — no recurring billing",
    amountInr: 1499,
    interval: "once",
    accessDays: null,
  },
  TEAM_MONTHLY: {
    sku: "TEAM_MONTHLY",
    name: "Team / Family",
    tagline: "Up to 5 people, shared groups, and a leaderboard",
    amountInr: 399,
    interval: "month",
    accessDays: 30,
  },
  ADDON_AI_COACHING: {
    sku: "ADDON_AI_COACHING",
    name: "AI coaching",
    tagline: "Personalized habit insights from your own stats",
    amountInr: 199,
    interval: "once",
    accessDays: null,
  },
  ADDON_EXPORT: {
    sku: "ADDON_EXPORT",
    name: "Advanced export",
    tagline: "Formatted CSV reports and a printable PDF summary",
    amountInr: 99,
    interval: "once",
    accessDays: null,
  },
  ADDON_NOTIFICATIONS: {
    sku: "ADDON_NOTIFICATIONS",
    name: "Custom alerts & calendar",
    tagline: "Custom reminder windows and calendar sync unlock",
    amountInr: 149,
    interval: "once",
    accessDays: null,
  },
};

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export const FREE_TIER = {
  name: "Free",
  tagline: "Core habit tracking, forever",
  features: [
    `Up to ${FREE_HABIT_LIMIT} active habits`,
    "Today checklist, journal, and rewards",
    "Basic streaks",
    `${FREE_HISTORY_DAYS}-day activity history`,
    "JSON data export (DPDP)",
  ],
} as const;

export const PRO_FEATURES = [
  "Unlimited habits",
  "Full history (not capped at 30 days)",
  "Advanced stats, charts, and heatmaps",
  "AI coaching, formatted export, and custom alerts",
  "14-day Pro trial on every new account",
] as const;

export const TEAM_FEATURES = [
  "Everything in Pro",
  `Shared groups for up to ${TEAM_SEAT_LIMIT} people`,
  "Group challenges and leaderboard",
  "Accountability dashboard",
] as const;

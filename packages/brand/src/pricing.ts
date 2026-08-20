/** Shared catalog for Alavo freemium billing (v1 Payment Links). */

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

export type BillingCurrency = "INR" | "USD";
export type BillingMarket = "IN" | "INTL";

export type BillingCatalogItem = {
  sku: BillingSku;
  name: string;
  tagline: string;
  amountInr: number;
  amountUsd: number;
  interval: "month" | "year" | "once";
  accessDays: number | null;
  recommended?: boolean;
};

export const BILLING_CATALOG: Record<BillingSku, BillingCatalogItem> = {
  PRO_MONTHLY: {
    sku: "PRO_MONTHLY",
    name: "Pro monthly",
    tagline: "Unlimited habits, full history, and advanced analytics",
    amountInr: 199,
    amountUsd: 5,
    interval: "month",
    accessDays: 30,
  },
  PRO_YEARLY: {
    sku: "PRO_YEARLY",
    name: "Pro yearly",
    tagline: "Two months free vs monthly — best for solo tracking",
    amountInr: 999,
    amountUsd: 30,
    interval: "year",
    accessDays: 365,
    recommended: true,
  },
  LIFETIME: {
    sku: "LIFETIME",
    name: "Lifetime unlock",
    tagline: "Pay once for Pro forever — no recurring billing",
    amountInr: 2999,
    amountUsd: 99,
    interval: "once",
    accessDays: null,
  },
  TEAM_MONTHLY: {
    sku: "TEAM_MONTHLY",
    name: "Team / Family",
    tagline: "Up to 5 people, shared groups, and a leaderboard",
    amountInr: 399,
    amountUsd: 12,
    interval: "month",
    accessDays: 30,
  },
  ADDON_AI_COACHING: {
    sku: "ADDON_AI_COACHING",
    name: "AI coaching",
    tagline: "Personalized habit insights from your own stats",
    amountInr: 199,
    amountUsd: 5,
    interval: "once",
    accessDays: null,
  },
  ADDON_EXPORT: {
    sku: "ADDON_EXPORT",
    name: "Advanced export",
    tagline: "Formatted CSV reports and a printable PDF summary",
    amountInr: 99,
    amountUsd: 3,
    interval: "once",
    accessDays: null,
  },
  ADDON_NOTIFICATIONS: {
    sku: "ADDON_NOTIFICATIONS",
    name: "Custom alerts & calendar",
    tagline: "Custom reminder windows and calendar sync unlock",
    amountInr: 149,
    amountUsd: 4,
    interval: "once",
    accessDays: null,
  },
};

export const INDIA_TIMEZONES = new Set(["Asia/Kolkata", "Asia/Calcutta"]);

export function marketFromCountry(country?: string | null): BillingMarket | null {
  if (!country?.trim()) return null;
  return country.trim().toUpperCase() === "IN" ? "IN" : "INTL";
}

export function marketFromTimezone(timeZone?: string | null): BillingMarket | null {
  if (!timeZone) return null;
  return INDIA_TIMEZONES.has(timeZone) ? "IN" : "INTL";
}

export function detectClientMarket(): BillingMarket {
  if (typeof Intl === "undefined") return "IN";
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fromTz = marketFromTimezone(timeZone);
  if (fromTz === "IN") return "IN";

  if (typeof navigator !== "undefined") {
    const langs = navigator.languages?.length
      ? navigator.languages
      : [navigator.language];
    if (langs.some((lang) => /-IN$/i.test(lang) || /^hi\b/i.test(lang))) {
      return "IN";
    }
  }

  return fromTz ?? "INTL";
}

export function currencyForMarket(market: BillingMarket): BillingCurrency {
  return market === "IN" ? "INR" : "USD";
}

export function catalogAmount(
  item: BillingCatalogItem,
  currency: BillingCurrency
) {
  return currency === "USD" ? item.amountUsd : item.amountInr;
}

export function amountMinorUnits(sku: BillingSku, currency: BillingCurrency) {
  return catalogAmount(BILLING_CATALOG[sku], currency) * 100;
}

export function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMoney(amount: number, currency: BillingCurrency) {
  return currency === "USD" ? formatUsd(amount) : formatInr(amount);
}

export function formatMinorUnits(amountMinor: number, currency: BillingCurrency) {
  return formatMoney(amountMinor / 100, currency);
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

export const PRICING_COPY: Record<
  BillingMarket,
  {
    intro: string;
    lifetimeHint: string;
    lifetimeNote: string;
    monthlyHint: string;
    yearlyHint: string;
    processor: string;
  }
> = {
  IN: {
    intro: `Every new account gets ${TRIAL_DAYS} days of Pro. After that, Free stays forever for up to ${FREE_HABIT_LIMIT} habits, basic streaks, and ${FREE_HISTORY_DAYS}-day history. Pay only if you want analytics or unlimited habits.`,
    lifetimeHint: "One payment via Razorpay. No recurring billing.",
    lifetimeNote: "Best value for long-term tracking in India",
    monthlyHint: "Unlimited habits + analytics, billed monthly",
    yearlyHint: "Best value — two months free vs paying monthly",
    processor: "Razorpay",
  },
  INTL: {
    intro: `Every new account gets ${TRIAL_DAYS} days of Pro. After that, Free stays forever for up to ${FREE_HABIT_LIMIT} habits, basic streaks, and ${FREE_HISTORY_DAYS}-day history. Pay only if you want analytics or unlimited habits.`,
    lifetimeHint: "One payment. No recurring billing.",
    lifetimeNote: "Pay once for Pro, forever",
    monthlyHint: "Unlimited habits + analytics, billed monthly",
    yearlyHint: "Best value — two months free vs paying monthly",
    processor: "Razorpay",
  },
};

export const BILLING_MARKETS: BillingMarket[] = ["IN", "INTL"];

export const DEFAULT_ENABLED_SKUS: BillingSku[] = [
  "PRO_MONTHLY",
  "PRO_YEARLY",
  "LIFETIME",
];

export type BillingPackageConfig = {
  name: string;
  tagline: string;
  hint: string;
  amount: number;
  enabled: boolean;
  recommended: boolean;
  sortOrder: number;
  features: string[];
};

export type BillingFreeConfig = {
  name: string;
  tagline: string;
  features: string[];
};

export type BillingMarketConfig = {
  currency: BillingCurrency;
  label: string;
  intro: string;
  free: BillingFreeConfig;
  packages: Record<BillingSku, BillingPackageConfig>;
};

export type BillingSettings = {
  markets: Record<BillingMarket, BillingMarketConfig>;
};

export type LivePackage = BillingPackageConfig & {
  sku: BillingSku;
  currency: BillingCurrency;
  interval: BillingCatalogItem["interval"];
};

export type LiveMarketCatalog = {
  market: BillingMarket;
  currency: BillingCurrency;
  label: string;
  intro: string;
  free: BillingFreeConfig;
  packages: LivePackage[];
};

function defaultHint(sku: BillingSku, market: BillingMarket) {
  const copy = PRICING_COPY[market];
  if (sku === "PRO_MONTHLY") return copy.monthlyHint;
  if (sku === "PRO_YEARLY") return copy.yearlyHint;
  if (sku === "LIFETIME") return copy.lifetimeHint;
  return BILLING_CATALOG[sku].tagline;
}

function defaultFeatures(sku: BillingSku, market: BillingMarket): string[] {
  if (sku === "PRO_MONTHLY" || sku === "PRO_YEARLY") return [...PRO_FEATURES];
  if (sku === "LIFETIME") {
    return ["Everything in Pro, forever", PRICING_COPY[market].lifetimeNote];
  }
  if (sku === "TEAM_MONTHLY") return [...TEAM_FEATURES];
  return [BILLING_CATALOG[sku].tagline];
}

function defaultSortOrder(sku: BillingSku) {
  const order: Record<BillingSku, number> = {
    PRO_MONTHLY: 1,
    PRO_YEARLY: 2,
    LIFETIME: 3,
    TEAM_MONTHLY: 4,
    ADDON_AI_COACHING: 10,
    ADDON_EXPORT: 11,
    ADDON_NOTIFICATIONS: 12,
  };
  return order[sku];
}

export function defaultPackageConfig(
  sku: BillingSku,
  market: BillingMarket
): BillingPackageConfig {
  const item = BILLING_CATALOG[sku];
  return {
    name: item.name,
    tagline: item.tagline,
    hint: defaultHint(sku, market),
    amount: catalogAmount(item, currencyForMarket(market)),
    enabled: DEFAULT_ENABLED_SKUS.includes(sku),
    recommended: Boolean(item.recommended),
    sortOrder: defaultSortOrder(sku),
    features: defaultFeatures(sku, market),
  };
}

export function defaultMarketConfig(market: BillingMarket): BillingMarketConfig {
  const packages = Object.fromEntries(
    BILLING_SKUS.map((sku) => [sku, defaultPackageConfig(sku, market)])
  ) as Record<BillingSku, BillingPackageConfig>;

  return {
    currency: currencyForMarket(market),
    label: market === "IN" ? "India · INR" : "International · USD",
    intro: PRICING_COPY[market].intro,
    free: {
      name: FREE_TIER.name,
      tagline: FREE_TIER.tagline,
      features: [...FREE_TIER.features],
    },
    packages,
  };
}

export function defaultBillingSettings(): BillingSettings {
  return {
    markets: {
      IN: defaultMarketConfig("IN"),
      INTL: defaultMarketConfig("INTL"),
    },
  };
}

function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : fallback;
}

export function mergeBillingSettings(raw: unknown): BillingSettings {
  const defaults = defaultBillingSettings();
  if (!raw || typeof raw !== "object") return defaults;
  const incoming = raw as Partial<BillingSettings>;
  const markets = incoming.markets ?? {};

  for (const market of BILLING_MARKETS) {
    const fallback = defaults.markets[market];
    const next = markets[market];
    if (!next || typeof next !== "object") continue;
    fallback.intro = typeof next.intro === "string" && next.intro.trim() ? next.intro : fallback.intro;
    fallback.label = typeof next.label === "string" && next.label.trim() ? next.label : fallback.label;
    if (next.free && typeof next.free === "object") {
      fallback.free = {
        name: next.free.name?.trim() || fallback.free.name,
        tagline: next.free.tagline?.trim() || fallback.free.tagline,
        features: asStringArray(next.free.features, fallback.free.features),
      };
    }
    for (const sku of BILLING_SKUS) {
      const pkg = next.packages?.[sku];
      if (!pkg || typeof pkg !== "object") continue;
      const amount = Number(pkg.amount);
      fallback.packages[sku] = {
        name: pkg.name?.trim() || fallback.packages[sku].name,
        tagline: pkg.tagline?.trim() || fallback.packages[sku].tagline,
        hint: pkg.hint?.trim() || fallback.packages[sku].hint,
        amount:
          Number.isFinite(amount) && amount >= 0
            ? Math.round(amount)
            : fallback.packages[sku].amount,
        enabled: typeof pkg.enabled === "boolean" ? pkg.enabled : fallback.packages[sku].enabled,
        recommended:
          typeof pkg.recommended === "boolean"
            ? pkg.recommended
            : fallback.packages[sku].recommended,
        sortOrder:
          Number.isFinite(Number(pkg.sortOrder))
            ? Math.round(Number(pkg.sortOrder))
            : fallback.packages[sku].sortOrder,
        features: asStringArray(pkg.features, fallback.packages[sku].features),
      };
    }
  }

  return defaults;
}

export function liveMarketCatalog(
  settings: BillingSettings,
  market: BillingMarket,
  options?: { includeDisabled?: boolean }
): LiveMarketCatalog {
  const config = settings.markets[market] ?? defaultMarketConfig(market);
  const packages = BILLING_SKUS.map((sku) => {
    const pkg = config.packages[sku] ?? defaultPackageConfig(sku, market);
    return {
      ...pkg,
      sku,
      currency: config.currency,
      interval: BILLING_CATALOG[sku].interval,
    };
  })
    .filter((pkg) => options?.includeDisabled || pkg.enabled)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

  return {
    market,
    currency: config.currency,
    label: config.label,
    intro: config.intro,
    free: config.free,
    packages,
  };
}

export function intervalSuffix(interval: BillingCatalogItem["interval"]) {
  if (interval === "month") return "/mo";
  if (interval === "year") return "/year";
  return "";
}

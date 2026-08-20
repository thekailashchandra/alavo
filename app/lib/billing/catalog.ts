import {
  BILLING_MARKETS,
  BILLING_SKUS,
  currencyForMarket,
  liveMarketCatalog,
  mergeBillingSettings,
  type BillingMarket,
  type BillingSettings,
  type BillingSku,
} from "@alavo/brand";
import { prisma } from "@/lib/prisma";

export const BILLING_SETTING_KEY = "billing";

export async function getBillingSettings(): Promise<BillingSettings> {
  const row = await prisma.appSetting.findUnique({
    where: { key: BILLING_SETTING_KEY },
  });
  return mergeBillingSettings(row?.value);
}

export async function saveBillingSettings(settings: BillingSettings) {
  const value = mergeBillingSettings(settings);
  await prisma.appSetting.upsert({
    where: { key: BILLING_SETTING_KEY },
    update: { value },
    create: { key: BILLING_SETTING_KEY, value },
  });
  return value;
}

export async function getLiveMarketCatalog(
  market: BillingMarket,
  options?: { includeDisabled?: boolean }
) {
  const settings = await getBillingSettings();
  return liveMarketCatalog(settings, market, options);
}

export async function getLivePackage(sku: BillingSku, market: BillingMarket) {
  const settings = await getBillingSettings();
  const pkg = settings.markets[market]?.packages[sku];
  if (!pkg) return null;
  return {
    ...pkg,
    sku,
    currency: currencyForMarket(market),
  };
}

export async function amountMinorForLiveSku(sku: BillingSku, market: BillingMarket) {
  const pkg = await getLivePackage(sku, market);
  return Math.max(0, Math.round((pkg?.amount ?? 0) * 100));
}

export function isBillingMarket(value: unknown): value is BillingMarket {
  return BILLING_MARKETS.includes(value as BillingMarket);
}

export function isBillingSku(value: unknown): value is BillingSku {
  return BILLING_SKUS.includes(value as BillingSku);
}

import type { NextRequest } from "next/server";
import {
  currencyForMarket,
  marketFromCountry,
  type BillingCurrency,
  type BillingMarket,
} from "@alavo/brand";

export function countryFromRequest(req: NextRequest) {
  const value = (
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    ""
  )
    .trim()
    .toUpperCase();
  return value || null;
}

export function marketFromRequest(
  req: NextRequest,
  fallback?: BillingMarket | null
): BillingMarket {
  return (
    marketFromCountry(countryFromRequest(req)) ??
    (fallback === "IN" || fallback === "INTL" ? fallback : null) ??
    "IN"
  );
}

export function currencyFromRequest(
  req: NextRequest,
  fallback?: BillingMarket | null
): BillingCurrency {
  return currencyForMarket(marketFromRequest(req, fallback));
}

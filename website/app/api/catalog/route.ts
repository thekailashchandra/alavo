import { NextRequest, NextResponse } from "next/server";
import {
  defaultBillingSettings,
  liveMarketCatalog,
  type BillingMarket,
} from "@alavo/brand";

function appOrigin() {
  return (
    process.env.NEXT_PUBLIC_PRODUCT_URL ||
    process.env.APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function GET(req: NextRequest) {
  const requested = req.nextUrl.searchParams.get("market");
  const market: BillingMarket = requested === "INTL" ? "INTL" : "IN";
  const fallback = liveMarketCatalog(defaultBillingSettings(), market);

  try {
    const res = await fetch(`${appOrigin()}/api/billing/catalog?market=${market}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(fallback);
    }
    const data = await res.json();
    if (!data?.packages) return NextResponse.json(fallback);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=30" },
    });
  } catch {
    return NextResponse.json(fallback);
  }
}

import { NextRequest } from "next/server";
import { liveMarketCatalog } from "@alavo/brand";
import { jsonOk, handleApiError } from "@/lib/api";
import {
  getBillingSettings,
  isBillingMarket,
} from "@/lib/billing/catalog";

export async function GET(req: NextRequest) {
  try {
    const requested = req.nextUrl.searchParams.get("market");
    const market = isBillingMarket(requested) ? requested : null;
    const settings = await getBillingSettings();

    if (market) {
      return jsonOk(liveMarketCatalog(settings, market), {
        headers: { "Cache-Control": "public, max-age=30" },
      });
    }

    return jsonOk(
      {
        IN: liveMarketCatalog(settings, "IN"),
        INTL: liveMarketCatalog(settings, "INTL"),
      },
      { headers: { "Cache-Control": "public, max-age=30" } }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

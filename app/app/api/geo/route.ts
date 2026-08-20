import { NextRequest, NextResponse } from "next/server";
import { marketFromCountry } from "@alavo/brand";
import { countryFromRequest } from "@/lib/billing/market";

export async function GET(req: NextRequest) {
  const country = countryFromRequest(req);
  return NextResponse.json({
    country,
    market: marketFromCountry(country),
  });
}

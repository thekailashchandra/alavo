import { NextRequest, NextResponse } from "next/server";
import { marketFromCountry } from "@alavo/brand";

export async function GET(req: NextRequest) {
  const country = (
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    ""
  )
    .trim()
    .toUpperCase();

  return NextResponse.json({
    country: country || null,
    market: marketFromCountry(country),
  });
}

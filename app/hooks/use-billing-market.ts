"use client";

import { useEffect, useState } from "react";
import {
  detectClientMarket,
  marketFromCountry,
  type BillingMarket,
} from "@alavo/brand";

export function useBillingMarket() {
  const [market, setMarket] = useState<BillingMarket>(detectClientMarket);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/geo")
      .then(
        (res) =>
          res.json() as Promise<{
            country?: string | null;
            market?: BillingMarket | null;
          }>
      )
      .then((data) => {
        if (cancelled) return;
        const fromCountry = marketFromCountry(data.country);
        if (fromCountry) {
          setMarket(fromCountry);
          return;
        }
        if (data.market === "IN" || data.market === "INTL") {
          setMarket(data.market);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return market;
}

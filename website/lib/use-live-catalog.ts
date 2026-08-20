"use client";

import { useEffect, useState } from "react";
import {
  defaultBillingSettings,
  liveMarketCatalog,
  type BillingMarket,
  type LiveMarketCatalog,
} from "@alavo/brand";

export function useLiveCatalog(market: BillingMarket) {
  const [catalog, setCatalog] = useState<LiveMarketCatalog>(() =>
    liveMarketCatalog(defaultBillingSettings(), market)
  );

  useEffect(() => {
    let cancelled = false;
    setCatalog(liveMarketCatalog(defaultBillingSettings(), market));
    void fetch(`/api/catalog?market=${market}`)
      .then((res) => res.json() as Promise<LiveMarketCatalog>)
      .then((data) => {
        if (cancelled || !data?.packages) return;
        setCatalog(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [market]);

  return catalog;
}

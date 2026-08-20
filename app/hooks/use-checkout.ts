"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { parseJson } from "@/lib/api-client";
import type { BillingMarket, BillingSku } from "@alavo/brand";

export function useCheckout() {
  const { fetchWithAuth, refresh } = useAuth();
  const [pendingSku, setPendingSku] = useState<BillingSku | null>(null);

  const checkout = useCallback(
    async (sku: BillingSku, couponCode?: string, market?: BillingMarket) => {
      setPendingSku(sku);
      try {
        const res = await fetchWithAuth("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku,
            ...(couponCode?.trim() ? { couponCode: couponCode.trim() } : {}),
            ...(market ? { market } : {}),
          }),
        });
        const json = await parseJson<{ url: string; dev?: boolean; granted?: boolean }>(
          res
        );
        if (json.dev || json.granted) {
          toast.success(json.granted ? "Coupon applied" : "Dev unlock applied");
          await refresh();
        }
        window.location.href = json.url;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Checkout failed");
        setPendingSku(null);
      }
    },
    [fetchWithAuth, refresh]
  );

  return { checkout, pendingSku };
}

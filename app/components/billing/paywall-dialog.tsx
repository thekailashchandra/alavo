"use client";

import { Sparkles } from "lucide-react";
import { BILLING_CATALOG, formatInr } from "@alavo/brand";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCheckout } from "@/hooks/use-checkout";
import {
  recommendedSkuForFeature,
  featureLabel,
  type FeatureKey,
} from "@/lib/billing/entitlements";

export function PaywallDialog({
  open,
  onOpenChange,
  feature,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: FeatureKey;
}) {
  const { checkout, pendingSku } = useCheckout();
  const sku = recommendedSkuForFeature(feature);
  const item = BILLING_CATALOG[sku];
  const lifetime = BILLING_CATALOG.LIFETIME;
  const monthly = BILLING_CATALOG.PRO_MONTHLY;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-100" />
            Unlock {featureLabel(feature)}
          </DialogTitle>
          <DialogDescription>
            Core tracking stays free. This is extra depth — not a demo cutoff.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {sku !== "LIFETIME" && sku !== "PRO_MONTHLY" && sku !== "PRO_YEARLY" ? (
            <div className="rounded-2xl border border-primary-30 bg-primary-20/40 p-4">
              <p className="text-sm font-semibold text-gray-100">{item.name}</p>
              <p className="mt-1 text-xs text-gray-60">{item.tagline}</p>
              <p className="mt-2 text-lg font-bold text-primary-100">
                {formatInr(item.amountInr)}
                {item.interval === "month" ? "/mo" : item.interval === "year" ? "/yr" : " once"}
              </p>
              <Button
                className="mt-3 w-full"
                disabled={pendingSku != null}
                onClick={() => void checkout(sku)}
              >
                {pendingSku === sku ? "Redirecting…" : `Get ${item.name}`}
              </Button>
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-20 bg-white p-4">
            <p className="text-sm font-semibold text-gray-100">Pro</p>
            <p className="mt-1 text-xs text-gray-60">
              Unlimited habits, full history, and advanced analytics.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={pendingSku != null}
                onClick={() => void checkout("PRO_MONTHLY")}
              >
                {formatInr(monthly.amountInr)}/mo
              </Button>
              <Button
                className="flex-1"
                disabled={pendingSku != null}
                onClick={() => void checkout("LIFETIME")}
              >
                {formatInr(lifetime.amountInr)} lifetime
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

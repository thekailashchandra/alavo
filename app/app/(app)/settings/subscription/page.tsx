"use client";

import { useEffect, useMemo, useState } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import { Gift, History, Sparkles } from "lucide-react";
import {
  formatMinorUnits,
  formatMoney,
  intervalSuffix,
  type BillingSku,
} from "@alavo/brand";
import { SettingsBackHeader } from "@/components/settings/settings-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { useCheckout } from "@/hooks/use-checkout";
import { parseJson, type BillingSnapshot } from "@/lib/api-client";
import { toast } from "sonner";
import { useBillingMarket } from "@/hooks/use-billing-market";
import { useLiveCatalog } from "@/hooks/use-live-catalog";

type BillingResponse = {
  billing: BillingSnapshot;
  payments: {
    id: string;
    sku: BillingSku;
    name: string;
    amountInr: number;
    currency?: string;
    paidAt: string | null;
    createdAt: string;
  }[];
  paymentsReady: boolean;
};

function PlanCard({
  title,
  price,
  hint,
  features,
  cta,
  pending,
  highlight,
}: {
  title: string;
  price: string;
  hint: string;
  features: readonly string[];
  cta?: { label: string; onClick: () => void };
  pending?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-primary-100 bg-gradient-to-br from-primary-20 to-card"
          : "border-gray-20 bg-card"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-100">
        {title}
      </p>
      <p className="mt-1 text-2xl font-semibold text-gray-100">{price}</p>
      <p className="mt-1 text-xs text-gray-60">{hint}</p>
      <ul className="mt-3 space-y-1.5">
        {features.map((feature) => (
          <li key={feature} className="text-sm text-gray-100">
            · {feature}
          </li>
        ))}
      </ul>
      {cta ? (
        <Button
          className="mt-4 w-full"
          variant={highlight ? "default" : "outline"}
          disabled={pending}
          onClick={cta.onClick}
        >
          {pending ? "Redirecting…" : cta.label}
        </Button>
      ) : null}
    </div>
  );
}

export default function SubscriptionSettingsPage() {
  const { fetchWithAuth, refresh, user } = useAuth();
  const { checkout: startCheckout, pendingSku } = useCheckout();
  const market = useBillingMarket();
  const catalog = useLiveCatalog(market);
  const currency = catalog.currency;
  const [couponCode, setCouponCode] = useState("");
  const checkout = (sku: BillingSku) => startCheckout(sku, couponCode, market);
  const [payload, setPayload] = useState<BillingResponse | null>(null);

  useEffect(() => {
    void fetchWithAuth("/api/billing/entitlements")
      .then((res) => parseJson<BillingResponse>(res))
      .then(setPayload)
      .catch(() => {});
  }, [fetchWithAuth, user?.billing?.status]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1" || params.get("dev") === "1") {
      toast.success("Thanks — your plan is updated.");
      void refresh();
      window.history.replaceState({}, "", "/settings/subscription");
      return;
    }
    const paymentId = params.get("razorpay_payment_id");
    const signature = params.get("razorpay_signature");
    if (!paymentId || !signature) return;

    void fetchWithAuth("/api/billing/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_payment_id: paymentId,
        razorpay_payment_link_id: params.get("razorpay_payment_link_id"),
        razorpay_payment_link_reference_id: params.get(
          "razorpay_payment_link_reference_id"
        ),
        razorpay_payment_link_status: params.get("razorpay_payment_link_status"),
        razorpay_signature: signature,
      }),
    })
      .then((res) => parseJson(res))
      .then(async () => {
        toast.success("Payment confirmed");
        await refresh();
        window.history.replaceState({}, "", "/settings/subscription");
      })
      .catch(() => {
        toast.message("Payment received — unlocking shortly.");
      });
  }, [fetchWithAuth, refresh]);

  const billing = payload?.billing ?? user?.billing;
  const trialDays = useMemo(() => {
    if (!billing?.trialEndsAt || billing.status !== "trial") return null;
    return Math.max(
      0,
      differenceInCalendarDays(new Date(billing.trialEndsAt), new Date())
    );
  }, [billing]);

  return (
    <div className="space-y-6 pb-8">
      <SettingsBackHeader
        title="Plans & billing"
        subtitle="Free forever for core tracking. Pay only for depth."
      />

      <section className="px-5">
        <div className="rounded-2xl border border-primary-30 bg-gradient-to-br from-primary-20 to-primary-20 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-100">
                Current plan
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-100">
                {billing?.displayPlan ?? "Free"}
              </p>
              <p className="mt-1 text-sm text-primary-100">
                {billing?.status === "trial" && trialDays != null
                  ? `${trialDays} day${trialDays === 1 ? "" : "s"} left in your Pro trial`
                  : billing?.lifetime
                    ? "Lifetime Pro — no renewals"
                    : billing?.planExpiresAt
                      ? `Access through ${format(new Date(billing.planExpiresAt), "d MMM yyyy")}`
                      : "Core habit tracking included at no cost"}
              </p>
            </div>
            <Sparkles className="h-6 w-6 text-gray-60" />
          </div>
        </div>
      </section>

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          Plans
          <span className="ml-2 font-medium normal-case tracking-normal">
            {catalog.label}
          </span>
        </h2>
        <PlanCard
          title={catalog.free.name}
          price={formatMoney(0, currency)}
          hint={catalog.free.tagline}
          features={catalog.free.features}
        />
        {catalog.packages.map((pkg) => (
          <PlanCard
            key={pkg.sku}
            title={pkg.name}
            price={`${formatMoney(pkg.amount, pkg.currency)}${intervalSuffix(pkg.interval)}`}
            hint={pkg.hint}
            features={pkg.features}
            highlight={pkg.recommended || (pkg.sku === "LIFETIME" && billing?.lifetime)}
            pending={pendingSku === pkg.sku}
            cta={
              pkg.sku === "LIFETIME" && billing?.lifetime
                ? undefined
                : {
                    label:
                      pkg.sku === "PRO_MONTHLY" &&
                      billing?.plan === "PRO" &&
                      billing.status !== "trial"
                        ? `Extend ${pkg.name}`
                        : `Choose ${pkg.name}`,
                    onClick: () => void checkout(pkg.sku),
                  }
            }
          />
        ))}
      </section>

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          Promotional offers
        </h2>
        <div className="rounded-2xl border border-dashed border-primary-30 bg-card p-5">
          <Gift className="mx-auto h-8 w-8 text-gray-30" />
          <p className="mt-2 text-center text-sm font-medium text-gray-100">
            {billing?.status === "trial"
              ? "Your 14-day Pro trial is active"
              : "14-day Pro trial on every new account"}
          </p>
          <p className="mt-1 text-center text-xs text-gray-60">
            Have a coupon? Apply it here, then choose a plan.
          </p>
          <div className="mt-4 flex gap-2">
            <Input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="COUPON CODE"
              aria-label="Coupon code"
            />
            <Button
              type="button"
              variant="outline"
              disabled={!couponCode.trim() || pendingSku != null}
              onClick={async () => {
                try {
                  const res = await fetchWithAuth("/api/billing/redeem", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: couponCode }),
                  });
                  await parseJson(res);
                  toast.success("Coupon unlocked");
                  await refresh();
                  setCouponCode("");
                } catch (error) {
                  toast.message(
                    error instanceof Error
                      ? error.message
                      : "If this is a discount code, pick a plan to apply it."
                  );
                }
              }}
            >
              Apply
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          Payment history
        </h2>
        <div className="rounded-2xl border border-gray-20 bg-card p-5">
          {!payload?.payments.length ? (
            <div className="flex items-center gap-3 text-gray-60">
              <History className="h-5 w-5 shrink-0" />
              <p className="text-sm">No payments yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {payload.payments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-100">{payment.name}</p>
                    <p className="text-xs text-gray-60">
                      {payment.paidAt
                        ? format(new Date(payment.paidAt), "d MMM yyyy")
                        : format(new Date(payment.createdAt), "d MMM yyyy")}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-100">
                    {formatMinorUnits(
                      Math.round(payment.amountInr * 100),
                      payment.currency === "USD" ? "USD" : "INR"
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

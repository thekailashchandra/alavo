"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { differenceInCalendarDays, format } from "date-fns";
import { Gift, History, Sparkles, Users } from "lucide-react";
import {
  BILLING_CATALOG,
  FREE_TIER,
  PRO_FEATURES,
  TEAM_FEATURES,
  formatInr,
  type BillingSku,
} from "@alavo/brand";
import { SettingsBackHeader } from "@/components/settings/settings-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { useCheckout } from "@/hooks/use-checkout";
import { parseJson, type BillingSnapshot } from "@/lib/api-client";
import { toast } from "sonner";

type BillingResponse = {
  billing: BillingSnapshot;
  payments: {
    id: string;
    sku: BillingSku;
    name: string;
    amountInr: number;
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
          ? "border-primary-100 bg-gradient-to-br from-primary-20 to-white"
          : "border-gray-20 bg-white"
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
  const [couponCode, setCouponCode] = useState("");
  const checkout = (sku: BillingSku) => startCheckout(sku, couponCode);
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
        </h2>
        <PlanCard
          title={FREE_TIER.name}
          price="₹0"
          hint={FREE_TIER.tagline}
          features={FREE_TIER.features}
        />
        <PlanCard
          title="Pro"
          price={`${formatInr(BILLING_CATALOG.PRO_MONTHLY.amountInr)}/mo`}
          hint="or ₹799/year · unlimited habits + analytics"
          features={PRO_FEATURES}
          highlight={billing?.plan === "PRO"}
          pending={pendingSku === "PRO_MONTHLY" || pendingSku === "PRO_YEARLY"}
          cta={{
            label:
              billing?.plan === "PRO" && billing.status !== "trial"
                ? "Extend Pro"
                : "Go Pro monthly",
            onClick: () => void checkout("PRO_MONTHLY"),
          }}
        />
        <Button
          variant="outline"
          className="w-full"
          disabled={pendingSku != null}
          onClick={() => void checkout("PRO_YEARLY")}
        >
          {pendingSku === "PRO_YEARLY"
            ? "Redirecting…"
            : `Pro yearly · ${formatInr(BILLING_CATALOG.PRO_YEARLY.amountInr)}`}
        </Button>
        <PlanCard
          title="Lifetime unlock"
          price={formatInr(BILLING_CATALOG.LIFETIME.amountInr)}
          hint="One payment. Full Pro. No churn, no reminders."
          features={["Everything in Pro", "Best for personal-use, India pricing"]}
          highlight={billing?.lifetime}
          pending={pendingSku === "LIFETIME"}
          cta={
            billing?.lifetime
              ? undefined
              : {
                  label: "Pay once",
                  onClick: () => void checkout("LIFETIME"),
                }
          }
        />
        <PlanCard
          title="Team / Family"
          price={`${formatInr(BILLING_CATALOG.TEAM_MONTHLY.amountInr)}/mo`}
          hint="Up to 5 people · shared accountability"
          features={TEAM_FEATURES}
          highlight={billing?.plan === "TEAM"}
          pending={pendingSku === "TEAM_MONTHLY"}
          cta={{
            label: "Start Team",
            onClick: () => void checkout("TEAM_MONTHLY"),
          }}
        />
        <Link
          href="/team"
          className="flex items-center justify-center gap-2 text-sm font-medium text-primary-100"
        >
          <Users className="h-4 w-4" />
          Open team dashboard
        </Link>
      </section>

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          A-la-carte add-ons
        </h2>
        <p className="text-xs text-gray-60">
          Keep Free forever and buy only the power features you want.
        </p>
        {(
          [
            "ADDON_AI_COACHING",
            "ADDON_EXPORT",
            "ADDON_NOTIFICATIONS",
          ] as const
        ).map((sku) => {
          const item = BILLING_CATALOG[sku];
          const owned = billing?.addons.includes(sku);
          return (
            <div
              key={sku}
              className="flex items-center justify-between gap-3 rounded-2xl border border-gray-20 bg-white p-4"
            >
              <div>
                <p className="text-sm font-medium text-gray-100">{item.name}</p>
                <p className="text-xs text-gray-60">{item.tagline}</p>
              </div>
              <Button
                size="sm"
                variant={owned ? "ghost" : "outline"}
                disabled={owned || pendingSku != null}
                onClick={() => void checkout(sku)}
              >
                {owned ? "Unlocked" : formatInr(item.amountInr)}
              </Button>
            </div>
          );
        })}
      </section>

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          Promotional offers
        </h2>
        <div className="rounded-2xl border border-dashed border-primary-30 bg-white p-5">
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
        <div className="rounded-2xl border border-gray-20 bg-white p-5">
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
                    {formatInr(payment.amountInr)}
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

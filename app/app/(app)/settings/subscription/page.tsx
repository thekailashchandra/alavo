"use client";

import { Gift, History, Sparkles, XCircle } from "lucide-react";
import { SettingsBackHeader } from "@/components/settings/settings-nav";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SubscriptionSettingsPage() {
  return (
    <div className="space-y-6 pb-8">
      <SettingsBackHeader
        title="Subscription"
        subtitle="Your plan, billing, and promotional offers"
      />

      <section className="px-5">
        <div className="rounded-2xl border border-primary-30 bg-gradient-to-br from-primary-20 to-primary-20 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-100">
                Current plan
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-100">Free</p>
              <p className="mt-1 text-sm text-primary-100">
                All core habit tracking features included at no cost.
              </p>
            </div>
            <Sparkles className="h-6 w-6 text-gray-60" />
          </div>
        </div>
      </section>

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          Manage subscription
        </h2>

        <div className="rounded-2xl border border-gray-20 bg-white p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-100">Change subscription</p>
              <p className="text-xs text-gray-60">
                Upgrade when premium plans launch
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                toast.message("Premium plans are coming soon", {
                  description: "You’re on the free plan with full access to core features.",
                })
              }
            >
              View plans
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-gray-10 pt-4">
            <div>
              <p className="text-sm font-medium text-gray-100">Cancel subscription</p>
              <p className="text-xs text-gray-60">
                No active paid subscription to cancel
              </p>
            </div>
            <Button type="button" variant="ghost" size="sm" disabled>
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          Promotional offers
        </h2>
        <div className="rounded-2xl border border-dashed border-primary-30 bg-white p-5 text-center">
          <Gift className="mx-auto h-8 w-8 text-gray-30" />
          <p className="mt-2 text-sm font-medium text-gray-100">No offers right now</p>
          <p className="mt-1 text-xs text-gray-60">
            Check back here for seasonal discounts and referral rewards.
          </p>
        </div>
      </section>

      <section className="space-y-3 px-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
          Payment history
        </h2>
        <div className="rounded-2xl border border-gray-20 bg-white p-5">
          <div className="flex items-center gap-3 text-gray-60">
            <History className="h-5 w-5 shrink-0" />
            <p className="text-sm">No payments yet — you’re on the free plan.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

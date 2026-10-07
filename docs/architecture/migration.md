# Migration plan

This is the safe order for turning Alavo into open-source software plus paid-only Cloud. Do not skip the grandfathering rule.

## Current system

- Next.js app (`app/`) and marketing site (`website/`).
- Supabase Auth, Prisma, Postgres.
- Razorpay payment links. There is no Stripe subscription.
- Plans in `packages/brand/src/pricing.ts`: Pro monthly, Pro yearly, lifetime, plus disabled team and add-on SKUs.
- Free Cloud behavior today: 14-day Pro trial, then 5 habits and 30-day history. Existing rows are not deleted when a plan expires.
- Lifetime is `User.lifetime = true` and must keep working.

## Rules

- Do not drop tables, truncate data, or reset production.
- Do not remove a lifetime flag or an unexpired paid plan.
- Do not replace Razorpay until a migration maps existing `Payment` rows and lifetime users.
- Default `DEPLOYMENT_MODE` stays `cloud`.

## Done in the first increment

- Self-hosted mode unlocks core features without a payment.
- Checkout and coupon redemption refuse to run in self-hosted mode.
- Project docs and the AGPL-3.0 notice.

## Not done yet — needs an explicit go-ahead

1. Grandfather existing Cloud users. People who already have accounts, trials, free limits, Pro time, or lifetime access keep that access. New hosted signups are the ones who must pay.
2. Centralize the new plan names (`CLOUD`, `CLOUD_PRO`) beside the existing SKUs. Do not delete `LIFETIME` or existing prices.
3. Block new unpaid Cloud workspace access only after grandfathering is defined.
4. Add Stripe only as an additional provider, or replace Razorpay with a mapped migration. Do not silently invalidate Razorpay receipts.
5. Update alavo.cc marketing after the product behavior matches the copy. The site still says the core tracker is free to use online.
6. Finish Docker so auth does not depend on a separate Supabase project, if that remains the self-host goal.

## Files that will change later

- `packages/brand/src/pricing.ts` — plan catalog
- `app/lib/billing/entitlements.ts` — capability checks
- `website/app/page.tsx` and `website/components/home/pricing.tsx` — messaging
- `app/prisma/schema.prisma` — only additive fields, after review

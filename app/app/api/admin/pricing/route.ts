import { NextRequest } from "next/server";
import { z } from "zod";
import {
  BILLING_MARKETS,
  BILLING_SKUS,
  defaultBillingSettings,
  mergeBillingSettings,
  type BillingMarket,
  type BillingSku,
} from "@alavo/brand";
import { audit, requireAdmin } from "@/lib/admin";
import { jsonOk, handleApiError } from "@/lib/api";
import { getBillingSettings, saveBillingSettings } from "@/lib/billing/catalog";

const packageSchema = z.object({
  name: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(200),
  hint: z.string().trim().max(200),
  amount: z.number().min(0).max(1_000_000).transform((n) => Math.round(n)),
  enabled: z.boolean(),
  recommended: z.boolean(),
  sortOrder: z.number().min(0).max(100).transform((n) => Math.round(n)),
  features: z.array(z.string().trim().min(1).max(160)).min(1).max(12),
});

const packagesSchema = z.object({
  PRO_MONTHLY: packageSchema,
  PRO_YEARLY: packageSchema,
  LIFETIME: packageSchema,
  TEAM_MONTHLY: packageSchema,
  ADDON_AI_COACHING: packageSchema,
  ADDON_EXPORT: packageSchema,
  ADDON_NOTIFICATIONS: packageSchema,
});

const marketSchema = z.object({
  currency: z.enum(["INR", "USD"]),
  label: z.string().trim().min(1).max(80),
  intro: z.string().trim().min(1).max(800),
  free: z.object({
    name: z.string().trim().min(1).max(80),
    tagline: z.string().trim().max(200),
    features: z.array(z.string().trim().min(1).max(160)).min(1).max(12),
  }),
  packages: packagesSchema,
});

const saveSchema = z.object({
  markets: z.object({
    IN: marketSchema,
    INTL: marketSchema,
  }),
});

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req);
    if (error) return error;

    return jsonOk({
      settings: await getBillingSettings(),
      defaults: defaultBillingSettings(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user: admin, error } = await requireAdmin(req);
    if (error) return error;

    const parsed = saveSchema.parse(await req.json());
    const settings = await saveBillingSettings(mergeBillingSettings(parsed));
    await audit({
      actorEmail: admin!.email,
      action: "billing.pricing.update",
      detail: {
        markets: BILLING_MARKETS.reduce(
          (acc, market) => {
            acc[market] = Object.fromEntries(
              BILLING_SKUS.map((sku) => [
                sku,
                {
                  amount: settings.markets[market].packages[sku as BillingSku].amount,
                  enabled: settings.markets[market].packages[sku as BillingSku].enabled,
                },
              ])
            );
            return acc;
          },
          {} as Record<BillingMarket, Record<string, { amount: number; enabled: boolean }>>
        ),
      },
    });

    return jsonOk({ settings });
  } catch (error) {
    return handleApiError(error);
  }
}

import { describe, expect, it } from "vitest";
import {
  defaultBillingSettings,
  liveMarketCatalog,
  mergeBillingSettings,
} from "@alavo/brand";

describe("billing settings", () => {
  it("defaults to INR 199/999/2999 and USD 5/30/99", () => {
    const settings = defaultBillingSettings();
    expect(settings.markets.IN.packages.PRO_MONTHLY.amount).toBe(199);
    expect(settings.markets.IN.packages.PRO_YEARLY.amount).toBe(999);
    expect(settings.markets.IN.packages.LIFETIME.amount).toBe(2999);
    expect(settings.markets.INTL.packages.PRO_MONTHLY.amount).toBe(5);
    expect(settings.markets.INTL.packages.PRO_YEARLY.amount).toBe(30);
    expect(settings.markets.INTL.packages.LIFETIME.amount).toBe(99);
  });

  it("hides team and add-ons from the public catalog by default", () => {
    const publicIn = liveMarketCatalog(defaultBillingSettings(), "IN");
    expect(publicIn.packages.map((pkg) => pkg.sku)).toEqual([
      "PRO_MONTHLY",
      "PRO_YEARLY",
      "LIFETIME",
    ]);
  });

  it("applies admin amount and visibility overrides per market", () => {
    const merged = mergeBillingSettings({
      markets: {
        IN: {
          packages: {
            PRO_MONTHLY: { amount: 249, enabled: true },
            TEAM_MONTHLY: { enabled: true, amount: 499 },
          },
        },
      },
    });
    expect(merged.markets.IN.packages.PRO_MONTHLY.amount).toBe(249);
    expect(merged.markets.IN.packages.TEAM_MONTHLY.enabled).toBe(true);
    expect(merged.markets.INTL.packages.PRO_MONTHLY.amount).toBe(5);
    const publicIn = liveMarketCatalog(merged, "IN");
    expect(publicIn.packages.some((pkg) => pkg.sku === "TEAM_MONTHLY")).toBe(true);
  });
});

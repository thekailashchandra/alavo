import { describe, expect, it } from "vitest";
import { addDays, subDays } from "date-fns";
import {
  resolveEntitlements,
  recommendedSkuForFeature,
  trialWindow,
} from "./entitlements";

const now = new Date("2026-08-18T06:00:00.000Z");

describe("resolveEntitlements", () => {
  it("keeps a generous free tier with 5 habits and 30-day history", () => {
    const snap = resolveEntitlements(
      {
        plan: "FREE",
        planExpiresAt: null,
        lifetime: false,
        trialStartedAt: null,
        trialEndsAt: null,
        addons: [],
        teamCovered: false,
      },
      now
    );
    expect(snap.plan).toBe("FREE");
    expect(snap.limits.maxHabits).toBe(5);
    expect(snap.limits.historyDays).toBe(30);
    expect(snap.features.unlimitedHabits).toBe(false);
    expect(snap.features.advancedAnalytics).toBe(false);
    expect(snap.features.aiCoaching).toBe(false);
  });

  it("unlocks Pro during the signup trial", () => {
    const snap = resolveEntitlements(
      {
        plan: "FREE",
        planExpiresAt: null,
        lifetime: false,
        trialStartedAt: subDays(now, 1),
        trialEndsAt: addDays(now, 13),
        addons: [],
        teamCovered: false,
      },
      now
    );
    expect(snap.status).toBe("trial");
    expect(snap.displayPlan).toBe("Pro trial");
    expect(snap.features.unlimitedHabits).toBe(true);
    expect(snap.features.advancedAnalytics).toBe(true);
    expect(snap.features.teamGroups).toBe(false);
  });

  it("treats lifetime as Pro forever", () => {
    const snap = resolveEntitlements(
      {
        plan: "PRO",
        planExpiresAt: null,
        lifetime: true,
        trialStartedAt: now,
        trialEndsAt: addDays(now, 14),
        addons: [],
        teamCovered: false,
      },
      now
    );
    expect(snap.status).toBe("lifetime");
    expect(snap.planExpiresAt).toBeNull();
    expect(snap.features.fullHistory).toBe(true);
  });

  it("lets a-la-carte add-ons work on the free plan", () => {
    const snap = resolveEntitlements(
      {
        plan: "FREE",
        planExpiresAt: null,
        lifetime: false,
        trialStartedAt: null,
        trialEndsAt: null,
        addons: [{ sku: "ADDON_EXPORT", expiresAt: null }],
        teamCovered: false,
      },
      now
    );
    expect(snap.plan).toBe("FREE");
    expect(snap.features.advancedExport).toBe(true);
    expect(snap.features.unlimitedHabits).toBe(false);
  });

  it("grants Team features when covered by a family plan", () => {
    const snap = resolveEntitlements(
      {
        plan: "FREE",
        planExpiresAt: null,
        lifetime: false,
        trialStartedAt: null,
        trialEndsAt: null,
        addons: [],
        teamCovered: true,
      },
      now
    );
    expect(snap.plan).toBe("TEAM");
    expect(snap.features.teamGroups).toBe(true);
    expect(snap.features.unlimitedHabits).toBe(true);
  });

  it("expires Pro after planExpiresAt", () => {
    const snap = resolveEntitlements(
      {
        plan: "PRO",
        planExpiresAt: subDays(now, 1),
        lifetime: false,
        trialStartedAt: subDays(now, 40),
        trialEndsAt: subDays(now, 26),
        addons: [],
        teamCovered: false,
      },
      now
    );
    expect(snap.plan).toBe("FREE");
    expect(snap.status).toBe("expired");
    expect(snap.features.advancedAnalytics).toBe(false);
  });
});

describe("trialWindow", () => {
  it("is 14 days", () => {
    const start = new Date("2026-08-18T00:00:00.000Z");
    const window = trialWindow(start);
    expect(window.trialEndsAt.toISOString()).toBe("2026-09-01T00:00:00.000Z");
  });
});

describe("recommendedSkuForFeature", () => {
  it("maps power features to a-la-carte SKUs", () => {
    expect(recommendedSkuForFeature("aiCoaching")).toBe("ADDON_AI_COACHING");
    expect(recommendedSkuForFeature("teamGroups")).toBe("TEAM_MONTHLY");
    expect(recommendedSkuForFeature("unlimitedHabits")).toBe("LIFETIME");
  });
});

import { afterEach, describe, expect, it } from "vitest";
import { resolveEntitlements } from "@/lib/billing/entitlements";
import {
  applyDeploymentEntitlements,
  deploymentMode,
  isSelfHosted,
} from "@/lib/deployment-mode";

const free = resolveEntitlements(
  {
    plan: "FREE",
    planExpiresAt: null,
    lifetime: false,
    trialStartedAt: null,
    trialEndsAt: null,
    addons: [],
    teamCovered: false,
  },
  new Date("2026-08-18T06:00:00.000Z")
);

describe("deployment mode", () => {
  const previous = process.env.DEPLOYMENT_MODE;

  afterEach(() => {
    if (previous === undefined) delete process.env.DEPLOYMENT_MODE;
    else process.env.DEPLOYMENT_MODE = previous;
  });

  it("defaults to cloud and leaves entitlements unchanged", () => {
    delete process.env.DEPLOYMENT_MODE;
    expect(deploymentMode()).toBe("cloud");
    expect(isSelfHosted()).toBe(false);
    expect(applyDeploymentEntitlements(free)).toEqual(free);
  });

  it("unlocks the full core product when self-hosted", () => {
    process.env.DEPLOYMENT_MODE = "self-hosted";
    expect(isSelfHosted()).toBe(true);
    const snap = applyDeploymentEntitlements(free);
    expect(snap.displayPlan).toBe("Self-hosted");
    expect(snap.features.unlimitedHabits).toBe(true);
    expect(snap.features.teamGroups).toBe(true);
    expect(snap.limits.maxHabits).toBeNull();
    expect(snap.limits.historyDays).toBeNull();
  });

  it("accepts self_hosted as an alias", () => {
    process.env.DEPLOYMENT_MODE = "self_hosted";
    expect(deploymentMode()).toBe("self-hosted");
  });
});

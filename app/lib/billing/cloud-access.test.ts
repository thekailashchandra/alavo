import { describe, expect, it } from "vitest";
import {
  hasCloudWorkspaceAccess,
  isGrandfatheredCloudUser,
  shouldStartLegacyTrial,
  workspaceApiRequiresCloudPayment,
} from "@/lib/billing/cloud-access";

const cutoff = new Date("2026-10-01T00:00:00.000Z");
const before = new Date("2026-09-01T00:00:00.000Z");
const after = new Date("2026-10-06T00:00:00.000Z");

describe("cloud workspace access", () => {
  it("keeps an existing free user on the current rules", () => {
    expect(isGrandfatheredCloudUser(before, cutoff)).toBe(true);
    expect(shouldStartLegacyTrial(before, cutoff)).toBe(true);
    expect(
      hasCloudWorkspaceAccess({
        createdAt: before,
        lifetime: false,
        status: "free",
        cutoff,
      })
    ).toBe(true);
  });

  it("keeps an existing trial", () => {
    expect(
      hasCloudWorkspaceAccess({
        createdAt: before,
        lifetime: false,
        status: "trial",
        cutoff,
      })
    ).toBe(true);
  });

  it("keeps existing Pro and lifetime access", () => {
    expect(
      hasCloudWorkspaceAccess({
        createdAt: before,
        lifetime: false,
        status: "active",
        cutoff,
      })
    ).toBe(true);
    expect(
      hasCloudWorkspaceAccess({
        createdAt: before,
        lifetime: true,
        status: "lifetime",
        cutoff,
      })
    ).toBe(true);
  });

  it("denies a new unpaid Cloud user and skips the legacy trial", () => {
    expect(isGrandfatheredCloudUser(after, cutoff)).toBe(false);
    expect(shouldStartLegacyTrial(after, cutoff)).toBe(false);
    expect(
      hasCloudWorkspaceAccess({
        createdAt: after,
        lifetime: false,
        status: "free",
        cutoff,
      })
    ).toBe(false);
    expect(
      hasCloudWorkspaceAccess({
        createdAt: after,
        lifetime: false,
        status: "trial",
        cutoff,
      })
    ).toBe(false);
    expect(
      hasCloudWorkspaceAccess({
        createdAt: after,
        lifetime: false,
        status: "expired",
        cutoff,
      })
    ).toBe(false);
  });

  it("grants Cloud access after a new user pays", () => {
    expect(
      hasCloudWorkspaceAccess({
        createdAt: after,
        lifetime: false,
        status: "active",
        cutoff,
      })
    ).toBe(true);
    expect(
      hasCloudWorkspaceAccess({
        createdAt: after,
        lifetime: true,
        status: "lifetime",
        cutoff,
      })
    ).toBe(true);
  });

  it("gives self-hosted installs full access without payment", () => {
    expect(
      hasCloudWorkspaceAccess({
        createdAt: after,
        lifetime: false,
        status: "free",
        selfHosted: true,
        cutoff,
      })
    ).toBe(true);
  });

  it("treats a missing cutoff as the existing Cloud behavior", () => {
    expect(isGrandfatheredCloudUser(after, null)).toBe(true);
    expect(
      hasCloudWorkspaceAccess({
        createdAt: after,
        lifetime: false,
        status: "free",
        cutoff: null,
      })
    ).toBe(true);
  });

  it("protects habit APIs and leaves billing and account routes open", () => {
    expect(workspaceApiRequiresCloudPayment("http://localhost:3000/api/habits")).toBe(
      true
    );
    expect(workspaceApiRequiresCloudPayment("/api/logs")).toBe(true);
    expect(
      workspaceApiRequiresCloudPayment("http://localhost:3000/api/billing/checkout")
    ).toBe(false);
    expect(workspaceApiRequiresCloudPayment("/api/settings/account")).toBe(false);
    expect(workspaceApiRequiresCloudPayment("/api/settings/export")).toBe(false);
    expect(workspaceApiRequiresCloudPayment("/api/settings/activity")).toBe(true);
  });
});

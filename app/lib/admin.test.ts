import { describe, expect, it } from "vitest";
import {
  adminEmails,
  isSuperAdminEmail,
  SUPER_ADMIN_EMAIL,
  userIsAdmin,
} from "./admin-emails";

describe("isSuperAdminEmail", () => {
  it("recognizes alavoapp@gmail.com as super admin", () => {
    expect(SUPER_ADMIN_EMAIL).toBe("alavoapp@gmail.com");
    expect(isSuperAdminEmail("alavoapp@gmail.com")).toBe(true);
    expect(isSuperAdminEmail("AlavoApp@Gmail.com")).toBe(true);
  });

  it("rejects everyone else", () => {
    expect(isSuperAdminEmail("user@example.com")).toBe(false);
    expect(isSuperAdminEmail("")).toBe(false);
    expect(isSuperAdminEmail(null)).toBe(false);
  });

  it("always includes the hardcoded super admin", () => {
    expect(adminEmails().has("alavoapp@gmail.com")).toBe(true);
  });

  it("treats alavoapp@gmail.com as admin even without the API flag", () => {
    expect(userIsAdmin({ email: "alavoapp@gmail.com" })).toBe(true);
    expect(userIsAdmin({ email: "user@example.com", isAdmin: true })).toBe(true);
    expect(userIsAdmin({ email: "user@example.com" })).toBe(false);
  });
});

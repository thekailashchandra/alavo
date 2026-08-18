import { afterEach, describe, expect, it } from "vitest";
import {
  REGISTRATION_CLOSED_MESSAGE,
  RegistrationClosedError,
  isRegistrationClosed,
} from "./registration";

describe("registration gate", () => {
  afterEach(() => {
    delete process.env.REGISTRATION_CLOSED;
    delete process.env.NEXT_PUBLIC_REGISTRATION_CLOSED;
  });

  it("is open by default", () => {
    expect(isRegistrationClosed()).toBe(false);
  });

  it("closes when REGISTRATION_CLOSED is set", () => {
    process.env.REGISTRATION_CLOSED = "true";
    expect(isRegistrationClosed()).toBe(true);
  });

  it("exposes a stable error code", () => {
    const error = new RegistrationClosedError();
    expect(error.code).toBe("REGISTRATION_CLOSED");
    expect(error.message).toBe(REGISTRATION_CLOSED_MESSAGE);
  });
});

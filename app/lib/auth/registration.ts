export const REGISTRATION_CLOSED_CODE = "REGISTRATION_CLOSED";

export const REGISTRATION_CLOSED_MESSAGE =
  "New sign-ups are temporarily paused. If you already have an account, sign in instead.";

function parseClosedFlag(value: string | undefined) {
  return value === "true" || value === "1";
}

/** Server-side: block creating new app accounts. */
export function isRegistrationClosed() {
  return (
    parseClosedFlag(process.env.REGISTRATION_CLOSED) ||
    parseClosedFlag(process.env.NEXT_PUBLIC_REGISTRATION_CLOSED)
  );
}

/** Client-side: gate signup UI. */
export function isRegistrationClosedClient() {
  return parseClosedFlag(process.env.NEXT_PUBLIC_REGISTRATION_CLOSED);
}

export class RegistrationClosedError extends Error {
  readonly code = REGISTRATION_CLOSED_CODE;

  constructor(message = REGISTRATION_CLOSED_MESSAGE) {
    super(message);
    this.name = "RegistrationClosedError";
  }
}

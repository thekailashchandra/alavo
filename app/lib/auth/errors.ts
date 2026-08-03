/** Turn Supabase / unknown errors into a readable toast string. */
export function formatAuthError(error: unknown, fallback = "Something went wrong") {
  if (!error) return fallback;

  if (typeof error === "string") {
    const trimmed = error.trim();
    return trimmed && trimmed !== "{}" ? trimmed : fallback;
  }

  if (error instanceof Error) {
    const msg = error.message?.trim();
    if (msg && msg !== "{}") return msg;
  }

  if (typeof error === "object") {
    const e = error as {
      message?: unknown;
      error_description?: unknown;
      msg?: unknown;
      code?: unknown;
      status?: unknown;
      name?: unknown;
    };
    const candidates = [e.message, e.error_description, e.msg];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim() && c.trim() !== "{}") {
        return c.trim();
      }
    }
    if (e.status === 504 || e.status === 408) {
      return "Sign-up timed out. In Supabase → Authentication → Emails, configure SMTP (Gmail) or temporarily disable Confirm email.";
    }
    if (typeof e.code === "string" && e.code) {
      return `${fallback} (${e.code})`;
    }
  }

  return fallback;
}

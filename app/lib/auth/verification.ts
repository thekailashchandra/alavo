"use client";

import { authClient } from "@/lib/auth/client";

export function isDuplicateAccountError(message: string) {
  return /already|exist|registered|taken/i.test(message);
}

export function isUnverifiedError(message: string) {
  return /verify|unverified|email.*not.*verif|EMAIL_NOT_VERIFIED/i.test(message);
}

/** Send email-verification OTP; ignore benign failures (rate limit / already sent). */
export async function sendSignupVerificationOtp(email: string) {
  const normalized = email.trim().toLowerCase();
  const { error } = await authClient.emailOtp.sendVerificationOtp({
    email: normalized,
    type: "email-verification",
  });
  if (error) {
    // Fallback for projects still on link-based verification
    await authClient.sendVerificationEmail({
      email: normalized,
      callbackURL:
        typeof window !== "undefined"
          ? `${window.location.origin}/today`
          : "/today",
    });
  }
}

/**
 * After signup (or duplicate-email), keep the user out of the app until OTP succeeds.
 */
export async function finalizePendingVerification(email: string) {
  try {
    await authClient.signOut();
  } catch {
    // ignore
  }
  try {
    await sendSignupVerificationOtp(email);
  } catch {
    // User can still resend from the verify page
  }
}

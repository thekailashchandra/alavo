"use client";

import { createClient } from "@/lib/supabase/client";

export function isDuplicateAccountError(message: string) {
  return /already|exist|registered|taken/i.test(message);
}

export function isUnverifiedError(message: string) {
  return /verify|unverified|email.*not.*verif|confirm/i.test(message);
}

export async function sendSignupVerificationOtp(email: string) {
  const supabase = createClient();
  const normalized = email.trim().toLowerCase();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: normalized,
  });
  if (error) {
    // Fallback: email OTP challenge
    await supabase.auth.signInWithOtp({
      email: normalized,
      options: { shouldCreateUser: false },
    });
  }
}

export async function finalizePendingVerification(email: string) {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  try {
    await sendSignupVerificationOtp(email);
  } catch {
    // User can resend from verify page
  }
}

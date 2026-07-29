"use server";

import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { passwordSchema } from "@/lib/validations";

export type AuthActionState = { error?: string; success?: string } | null;

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    if (!process.env.NEON_AUTH_BASE_URL?.trim()) {
      return {
        error:
          "Neon Auth is not configured. Add NEON_AUTH_BASE_URL to .env and restart the server.",
      };
    }

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") || "");
    const name = String(formData.get("name") || email.split("@")[0] || "Alavo user");
    const timezone = String(formData.get("timezone") || "UTC");

    if (!email) return { error: "Email is required" };

    const passwordCheck = passwordSchema.safeParse(password);
    if (!passwordCheck.success) {
      return { error: passwordCheck.error.issues[0]?.message || "Invalid password" };
    }

    const { data, error } = await auth.signUp.email({
      email,
      password,
      name,
    });

    if (error) {
      const message = error.message || "Failed to create account";
      // Unverified account already exists — continue on verify page
      if (/already|exist|registered|taken/i.test(message)) {
        try {
          await auth.signOut();
        } catch {
          // ignore
        }
        redirect("/verify-email?email=" + encodeURIComponent(email));
      }
      return { error: message };
    }

    // Never treat signup as complete until email OTP is verified
    if (!data?.user?.emailVerified) {
      try {
        await auth.signOut();
      } catch {
        // ignore
      }
      redirect("/verify-email?email=" + encodeURIComponent(email));
    }

    await prisma.user.upsert({
      where: { email },
      create: {
        email,
        timezone,
        passwordHash: null,
        provider: "EMAIL",
        emailVerified: new Date(),
      },
      update: { timezone, emailVerified: new Date() },
    });

    redirect("/today");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest || "").startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : "Failed to create account";
    if (/invalid url/i.test(message)) {
      return {
        error:
          "Neon Auth URL is invalid or missing. Check NEON_AUTH_BASE_URL in .env, save the file, and restart npm run dev.",
      };
    }
    return { error: message };
  }
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    if (!process.env.NEON_AUTH_BASE_URL?.trim()) {
      return {
        error:
          "Neon Auth is not configured. Add NEON_AUTH_BASE_URL to .env and restart the server.",
      };
    }

    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(formData.get("password") || "");
    const timezone = String(formData.get("timezone") || "");

    const { error } = await auth.signIn.email({
      email,
      password,
    });

    if (error) {
      return { error: error.message || "Failed to sign in" };
    }

    if (timezone) {
      await prisma.user.updateMany({
        where: { email },
        data: { timezone },
      });
    }

    redirect("/today");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String((error as { digest?: string }).digest || "").startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : "Failed to sign in";
    if (/invalid url/i.test(message)) {
      return {
        error:
          "Neon Auth URL is invalid or missing. Check NEON_AUTH_BASE_URL in .env, save the file, and restart npm run dev.",
      };
    }
    return { error: message };
  }
}

export async function signOutAction() {
  await auth.signOut();
  redirect("/login");
}

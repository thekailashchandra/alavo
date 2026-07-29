"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import { getTimezone } from "@/lib/api-client";
import {
  finalizePendingVerification,
  isDuplicateAccountError,
} from "@/lib/auth/verification";
import { passwordSchema } from "@/lib/validations";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Prefetch timezone so we can pass it after verification
    void getTimezone();
  }, []);

  const goToVerify = (email: string, message: string) => {
    toast.success(message);
    router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") || "");

    if (!email) {
      toast.error("Email is required");
      return;
    }

    const passwordCheck = passwordSchema.safeParse(password);
    if (!passwordCheck.success) {
      toast.error(passwordCheck.error.issues[0]?.message || "Invalid password");
      return;
    }

    setPending(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: name || email.split("@")[0] || "Alavo user",
      });

      if (error) {
        const message = error.message || "Failed to create account";
        // Account already created earlier without finishing OTP — continue verify
        if (isDuplicateAccountError(message)) {
          await finalizePendingVerification(email);
          goToVerify(
            email,
            "This email already has an account. Enter the verification code we sent (or resend it)."
          );
          return;
        }
        throw new Error(message);
      }

      const verified = Boolean(data?.user?.emailVerified);
      if (verified) {
        await fetch("/api/auth/bootstrap", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timezone: getTimezone() }),
        }).catch(() => null);
        toast.success("Account created");
        router.replace("/today");
        return;
      }

      // Do not leave an unverified session active — OTP must complete first
      await finalizePendingVerification(email);
      goToVerify(email, "Check your email for a 6-digit code to finish signup.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create account"
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="phone-shell flex min-h-[100dvh] flex-col px-6 py-10">
      <div className="mb-10 space-y-3 pt-4">
        <BrandLogo priority className="max-w-[180px]" />
        <p className="text-sm text-muted-foreground">
          Create an account to start tracking habits.
        </p>
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-1 flex-col gap-5"
      >
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="8+ chars, letter, number, symbol"
              required
              minLength={8}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            At least 8 characters with a letter, number, and symbol.
          </p>
        </div>

        <Button type="submit" className="mt-2 h-12 w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

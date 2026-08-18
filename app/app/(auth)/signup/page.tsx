"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { LEGAL } from "@alavo/brand";
import { createClient } from "@/lib/supabase/client";
import { getTimezone, parseJson, type User } from "@/lib/api-client";
import {
  finalizePendingVerification,
  isDuplicateAccountError,
} from "@/lib/auth/verification";
import { formatAuthError } from "@/lib/auth/errors";
import { passwordSchema } from "@/lib/validations";
import { BrandLogo } from "@/components/brand-logo";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const PRIVACY_URL = `${LEGAL.websiteUrl}/privacy`;
const TERMS_URL = `${LEGAL.websiteUrl}/terms`;

async function recordSignupConsent() {
  const res = await fetch("/api/settings/consent", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ageConfirmed: true,
      method: "signup",
    }),
  });
  if (!res.ok) throw new Error("Could not record privacy consent");
  return parseJson<User>(res);
}

export default function SignupPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const consentReady = ageConfirmed && termsAccepted;

  useEffect(() => {
    void getTimezone();
  }, []);

  const goToVerify = (email: string, message: string) => {
    toast.success(message);
    router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!consentReady) {
      toast.error("Please confirm your age and accept the Terms and Privacy Policy");
      return;
    }

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
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name || email.split("@")[0] || "Alavo user" },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const message = formatAuthError(error, "Failed to create account");
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

      if (data.user?.email_confirmed_at && data.session) {
        await fetch("/api/auth/bootstrap", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timezone: getTimezone() }),
        }).catch(() => null);
        await recordSignupConsent();
        toast.success("Account created");
        router.replace("/today");
        return;
      }

      await finalizePendingVerification(email);
      goToVerify(email, "Check your email for a 6-digit code to finish signup.");
    } catch (error) {
      toast.error(formatAuthError(error, "Failed to create account"));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="phone-shell flex min-h-[100dvh] flex-col px-6 py-10">
      <div className="mb-10 space-y-3 pt-4">
        <BrandLogo priority className="max-w-[180px]" />
        <p className="text-sm text-muted-foreground">
          Create an account to start tracking habits. Every new account includes
          14 days of Pro — unlimited habits and full analytics — then Free stays
          forever for core tracking.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-5">
        <SocialAuthButtons
          disabled={pending}
          consentReady={consentReady}
          labelPrefix="Continue"
        />

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-5"
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

          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="signup-age"
                checked={ageConfirmed}
                onCheckedChange={(v) => setAgeConfirmed(v === true)}
              />
              <Label htmlFor="signup-age" className="text-sm leading-snug font-normal">
                I am {LEGAL.minimumAge} years of age or older.
              </Label>
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="signup-terms"
                checked={termsAccepted}
                onCheckedChange={(v) => setTermsAccepted(v === true)}
              />
              <Label htmlFor="signup-terms" className="text-sm leading-snug font-normal">
                I agree to the{" "}
                <Link
                  href={TERMS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href={PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Privacy Policy
                </Link>
                , including processing under the DPDP Act, 2023.
              </Label>
            </div>
          </div>

          <Button type="submit" className="mt-2 h-12 w-full" disabled={pending || !consentReady}>
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
    </div>
  );
}

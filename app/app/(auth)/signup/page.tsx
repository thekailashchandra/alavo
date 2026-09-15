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
import {
  REGISTRATION_CLOSED_MESSAGE,
  isRegistrationClosedClient,
} from "@/lib/auth/registration";
import { passwordSchema } from "@/lib/validations";
import { BrandLogo } from "@/components/brand-logo";
import { ConsentRequiredDialog } from "@/components/auth/consent-required-dialog";
import { RegistrationClosedNotice } from "@/components/auth/registration-closed-notice";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
  const registrationClosed = isRegistrationClosedClient();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentWarningOpen, setConsentWarningOpen] = useState(false);

  const consentReady = consentAccepted;

  useEffect(() => {
    void getTimezone();
  }, []);

  const requireConsent = () => {
    if (consentReady) return true;
    setConsentWarningOpen(true);
    return false;
  };

  const goToVerify = (email: string, message: string) => {
    toast.success(message);
    router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (registrationClosed) {
      toast.error(REGISTRATION_CLOSED_MESSAGE);
      return;
    }
    if (!requireConsent()) return;

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
        const bootstrap = await fetch("/api/auth/bootstrap", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timezone: getTimezone() }),
        });
        if (bootstrap.status === 403) {
          toast.error(REGISTRATION_CLOSED_MESSAGE);
          await supabase.auth.signOut();
          return;
        }
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

  if (registrationClosed) {
    return (
      <div className="phone-shell flex min-h-[100dvh] flex-col px-6 py-8">
        <div className="mb-6 space-y-2 pt-2">
          <BrandLogo priority className="max-w-[160px]" />
          <p className="text-sm text-muted-foreground">
            Alavo is not accepting new accounts right now.
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <RegistrationClosedNotice />
          <p className="text-center text-sm text-muted-foreground">
            Need help?{" "}
            <a href="mailto:hi@alavo.cc" className="font-medium text-primary hover:underline">
              hi@alavo.cc
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-shell flex min-h-[100dvh] flex-col px-6 py-8">
      <div className="mb-6 space-y-1.5 pt-2">
        <BrandLogo priority className="max-w-[160px]" />
        <p className="text-sm text-muted-foreground">
          Create an account. 14 days of Pro included.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4">
        <SocialAuthButtons
          disabled={pending}
          consentReady={consentReady}
          onConsentBlocked={() => setConsentWarningOpen(true)}
          labelPrefix="Continue"
        />

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex flex-col gap-3.5"
        >
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
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
          </div>

          <label
            htmlFor="signup-consent"
            className="mt-1 flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-white px-3 py-3 text-sm leading-snug"
          >
            <input
              id="signup-consent"
              type="checkbox"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 accent-[var(--primary)]"
            />
            <span>
              I am {LEGAL.minimumAge}+ and agree to the{" "}
              <Link
                href={TERMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href={PRIVACY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </Link>
            </span>
          </label>

          <Button
            type="submit"
            className={cn("mt-1 h-11 w-full", !consentReady && "opacity-50")}
            disabled={pending}
            aria-disabled={!consentReady}
          >
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

      <ConsentRequiredDialog
        open={consentWarningOpen}
        onOpenChange={setConsentWarningOpen}
      />
    </div>
  );
}

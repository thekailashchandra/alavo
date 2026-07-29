"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/components/providers/auth-provider";
import { authClient } from "@/lib/auth/client";
import { getTimezone } from "@/lib/api-client";
import { sendSignupVerificationOtp } from "@/lib/auth/verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function VerifyEmailContent() {
  const router = useRouter();
  const { refresh } = useAuth();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const autoSent = useRef(false);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  // Auto-send OTP once when landing here after signup
  useEffect(() => {
    const target = (emailParam || email).trim().toLowerCase();
    if (!target || autoSent.current) return;
    autoSent.current = true;
    void sendSignupVerificationOtp(target).catch(() => null);
  }, [emailParam, email]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Enter your email");
      return;
    }
    if (!code.trim()) {
      toast.error("Enter the verification code from your email");
      return;
    }

    setVerifying(true);
    try {
      const { error } = await authClient.emailOtp.verifyEmail({
        email: email.trim().toLowerCase(),
        otp: code.trim(),
      });
      if (error) throw new Error(error.message || "Invalid or expired code");

      // Sync local user as verified + timezone
      await fetch("/api/auth/bootstrap", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: getTimezone() }),
      }).catch(() => null);

      await refresh();
      toast.success("Email verified");
      router.replace("/today");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not verify");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Enter your email");
      return;
    }
    setResending(true);
    try {
      await sendSignupVerificationOtp(email);
      toast.success("Verification code sent — check inbox and spam.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not resend"
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="phone-shell flex min-h-dvh flex-col px-6 py-10">
      <div className="mb-8 space-y-3 pt-4">
        <BrandLogo priority className="max-w-40" />
        <h1 className="brand-title text-2xl font-semibold tracking-tight">
          Verify your email
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Enter the 6-digit code we sent
          {email ? (
            <>
              {" "}
              to <span className="font-medium text-foreground">{email}</span>
            </>
          ) : null}
          . Your account isn&apos;t active until this step is done.
        </p>
      </div>

      <form onSubmit={(e) => void handleVerify(e)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verify-email">Email</Label>
          <Input
            id="verify-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="verify-code">Verification code</Label>
          <Input
            id="verify-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\s/g, ""))}
            required
            maxLength={8}
            className="tracking-[0.3em] text-center text-lg"
          />
        </div>
        <Button type="submit" className="h-12 w-full" disabled={verifying}>
          {verifying ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <div className="mt-6 space-y-3 rounded-2xl border border-border bg-muted/40 p-4">
        <p className="text-sm text-muted-foreground">Didn&apos;t get the code?</p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => void handleResend()}
          disabled={resending}
        >
          {resending ? "Sending…" : "Resend code"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Check spam for mail from Alavo. If nothing arrives, set Custom SMTP
          (Gmail) in Neon Console → Auth, and turn on Verify at Sign-up with
          Verification code.
        </p>
      </div>

      <p className="mt-auto pt-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="phone-shell flex min-h-dvh items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(emailParam);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error("Enter your email");
      return;
    }
    setResending(true);
    try {
      // Better Auth / Neon Auth send verification email if supported
      const anyClient = authClient as unknown as {
        sendVerificationEmail?: (args: { email: string }) => Promise<{ error?: { message?: string } }>;
      };
      if (typeof anyClient.sendVerificationEmail === "function") {
        const { error } = await anyClient.sendVerificationEmail({ email });
        if (error) throw new Error(error.message || "Could not resend");
      }
      toast.success("If that account exists, a verification email was sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not resend");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="phone-shell flex min-h-[100dvh] flex-col px-6 py-10">
      <div className="mb-8 space-y-3 pt-4">
        <BrandLogo priority className="max-w-[160px]" />
        <h1 className="brand-title text-2xl font-semibold tracking-tight">
          Verify your email
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          We sent a verification link
          {email ? (
            <>
              {" "}
              to <span className="font-medium text-foreground">{email}</span>
            </>
          ) : null}
          . Open it to activate your Alavo account, then sign in.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-muted/40 p-4">
        <p className="text-sm text-muted-foreground">Didn&apos;t get the email?</p>
        <div className="space-y-2">
          <Label htmlFor="resend-email">Email</Label>
          <Input
            id="resend-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => void handleResend()}
          disabled={resending}
        >
          {resending ? "Sending…" : "Resend verification"}
        </Button>
        <p className="text-xs text-muted-foreground">
          With Resend test mode, delivery may only work to your Resend account email.
          Configure email in Neon Auth Console for production.
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
        <div className="phone-shell flex min-h-[100dvh] items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

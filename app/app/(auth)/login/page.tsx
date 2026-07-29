"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/components/providers/auth-provider";
import { sendSignupVerificationOtp } from "@/lib/auth/verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.emailVerified) {
      router.replace("/today");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "")
      .trim()
      .toLowerCase();
    const password = String(form.get("password") || "");

    if (!email || !password) {
      toast.error("Email and password are required");
      return;
    }

    setPending(true);
    try {
      await login(email, password);
      toast.success("Signed in");
      router.replace("/today");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to sign in";
      if (/verify|unverified|email.*not.*verif|EMAIL_NOT_VERIFIED/i.test(message)) {
        toast.error("Verify your email first — we sent a new code");
        try {
          await sendSignupVerificationOtp(email);
        } catch {
          // ignore — verify page can resend
        }
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="phone-shell flex min-h-dvh flex-col px-6 py-10">
      <div className="mb-10 space-y-3 pt-4">
        <BrandLogo priority className="max-w-[180px]" />
        <p className="text-sm text-muted-foreground">
          Welcome back — sign in to continue your streaks.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-1 flex-col gap-5">
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
              autoComplete="current-password"
              required
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

        <Button type="submit" className="mt-2 h-12 w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

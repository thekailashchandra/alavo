"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { signUpAction, type AuthActionState } from "@/lib/auth/actions";
import { getTimezone } from "@/lib/api-client";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
  const [timezone, setTimezone] = useState("UTC");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signUpAction,
    null
  );

  useEffect(() => {
    setTimezone(getTimezone());
  }, []);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="phone-shell flex min-h-[100dvh] flex-col px-6 py-10">
      <div className="mb-10 space-y-3 pt-4">
        <BrandLogo priority className="max-w-[180px]" />
        <p className="text-sm text-muted-foreground">
          Create an account to start tracking habits.
        </p>
      </div>

      <form action={formAction} className="flex flex-1 flex-col gap-5">
        <input type="hidden" name="timezone" value={timezone} />
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

"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { signInAction, type AuthActionState } from "@/lib/auth/actions";
import { getTimezone } from "@/lib/api-client";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [timezone, setTimezone] = useState("UTC");
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signInAction,
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
          Welcome back — sign in to continue your streaks.
        </p>
      </div>

      <form action={formAction} className="flex flex-1 flex-col gap-5">
        <input type="hidden" name="timezone" value={timezone} />
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
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
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

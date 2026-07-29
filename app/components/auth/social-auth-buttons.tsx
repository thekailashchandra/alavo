"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

type SocialProvider = "google" | "github";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.7.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.37-2.22-.26-4.55-1.14-4.55-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.8c.85 0 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.95.68 1.92 0 1.38-.01 2.49-.01 2.83 0 .26.18.59.69.48A10.03 10.03 0 0 0 22 12.26C22 6.58 17.52 2 12 2z" />
    </svg>
  );
}

export function SocialAuthButtons({
  disabled = false,
  labelPrefix = "Continue",
}: {
  disabled?: boolean;
  labelPrefix?: string;
}) {
  const [loading, setLoading] = useState<SocialProvider | null>(null);

  const startSocial = async (provider: SocialProvider) => {
    setLoading(provider);
    try {
      const origin = window.location.origin;
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: `${origin}/auth/callback?provider=${provider}`,
        newUserCallbackURL: `${origin}/auth/callback?provider=${provider}&new=1`,
        errorCallbackURL: `${origin}/login?error=oauth`,
      });
      if (error) {
        throw new Error(error.message || `Could not start ${provider} sign-in`);
      }
      // Browser should redirect; keep spinner if it doesn't immediately
    } catch (error) {
      setLoading(null);
      toast.error(
        error instanceof Error
          ? error.message
          : `Could not start ${provider} sign-in`
      );
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full"
        disabled={disabled || loading !== null}
        onClick={() => void startSocial("google")}
      >
        <GoogleIcon className="size-5" />
        {loading === "google"
          ? "Redirecting…"
          : `${labelPrefix} with Google`}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full"
        disabled={disabled || loading !== null}
        onClick={() => void startSocial("github")}
      >
        <GitHubIcon className="size-5" />
        {loading === "github"
          ? "Redirecting…"
          : `${labelPrefix} with GitHub`}
      </Button>

      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-background px-3 text-muted-foreground">or</span>
        </div>
      </div>
    </div>
  );
}

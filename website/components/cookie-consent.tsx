"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-ZGKTD3FLWW";
const CONSENT_KEY = "alavo_cookie_consent";

export function CookieConsent() {
  const [choice, setChoice] = useState<"pending" | "essential" | "all">(
    "pending"
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored === "essential" || stored === "all") setChoice(stored);
    } catch {
      // ignore
    }
  }, []);

  const save = (value: "essential" | "all") => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // ignore
    }
    setChoice(value);
  };

  return (
    <>
      {choice === "all" && GA_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {choice === "pending" ? (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="surface-card fixed inset-x-0 bottom-0 z-50 rounded-none border-x-0 border-b-0 p-4 md:p-5"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1 text-sm leading-relaxed text-[var(--foreground)]/90">
              <p className="font-semibold">Your privacy on alavo.cc</p>
              <p className="text-[var(--muted)]">
                We use essential cookies to run this site. With your consent, we
                also use Google Analytics to understand traffic. You can change
                this anytime. See our{" "}
                <a href="/privacy" className="font-medium text-[var(--primary)] underline-offset-2 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => save("essential")}
                className="btn-secondary h-10 px-5 text-sm"
              >
                Essential only
              </button>
              <button
                type="button"
                onClick={() => save("all")}
                className="btn-primary h-10 px-5 text-sm"
              >
                Accept analytics
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

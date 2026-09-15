"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@alavo/brand";
import { APP_URL } from "@/lib/site";

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200 ${
        scrolled
          ? "border-b border-[var(--alavo-gray-20)]/50 bg-[var(--alavo-primary-10)]/75 shadow-[0_8px_24px_-20px_rgba(52,54,77,0.35)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3 sm:gap-4 sm:px-6 sm:py-4 md:px-10">
        <Link href="/" aria-label="Alavo home" className="min-w-0 shrink">
          <BrandLogo
            priority
            className="h-auto w-[112px] object-contain object-left sm:w-[128px] md:w-[150px]"
          />
        </Link>
        <nav className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            href="/insights"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)] sm:inline-flex"
          >
            Insights
          </Link>
          <Link
            href="/pricing"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)] sm:inline-flex"
          >
            Pricing
          </Link>
          <Link
            href={`${APP_URL}/login`}
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href={`${APP_URL}/signup`}
            className="btn-primary h-9 px-4 text-sm sm:h-10 sm:px-5"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

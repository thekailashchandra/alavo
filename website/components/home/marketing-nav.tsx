import Link from "next/link";
import { BrandLogo } from "@alavo/brand";

const appUrl = (
  process.env.NEXT_PUBLIC_PRODUCT_URL || "https://app.alavo.cc"
).replace(/\/$/, "");

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--alavo-gray-20)]/80 bg-[var(--alavo-primary-10)]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-10">
        <BrandLogo
          priority
          className="h-auto w-[128px] object-contain object-left md:w-[150px]"
        />
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/pricing"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)] sm:inline-flex"
          >
            Pricing
          </Link>
          <Link
            href={`${appUrl}/login`}
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--muted)] transition hover:text-[var(--foreground)] sm:inline-flex"
          >
            Sign in
          </Link>
          <Link href={`${appUrl}/signup`} className="btn-primary h-10 px-5 text-sm">
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}

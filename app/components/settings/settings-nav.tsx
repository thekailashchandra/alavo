"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SettingsHubLink({
  href,
  title,
  description,
  icon: Icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-gray-20 bg-white p-4 transition hover:border-primary-30 hover:bg-primary-20/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-30 text-primary-100">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-gray-100">{title}</span>
        <span className="block text-xs text-gray-60">{description}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-30" />
    </Link>
  );
}

export function SettingsSection({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3 px-5", className)}>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-60">
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export function SettingsBackHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="px-5 pt-8">
      <Link
        href="/settings"
        className="mb-3 inline-flex text-sm font-medium text-primary-100 hover:text-primary-120"
      >
        ← Personal account
      </Link>
      <h1 className="brand-title text-2xl font-semibold tracking-tight text-gray-100">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-gray-60/80">{subtitle}</p>
      ) : null}
    </header>
  );
}

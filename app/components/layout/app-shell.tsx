"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="phone-shell flex flex-col">
      <main className={cn("flex-1 overflow-y-auto overscroll-contain", className)}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

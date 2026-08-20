"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { DesktopTopbar } from "@/components/layout/desktop-topbar";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className="phone-shell">
      <DesktopTopbar />
      <main className={cn("app-content", className)}>{children}</main>
      <BottomNav />
    </div>
  );
}

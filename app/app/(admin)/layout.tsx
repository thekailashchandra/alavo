"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { userIsAdmin } from "@/lib/admin-emails";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const isAdmin = userIsAdmin(user);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading && !user) {
    return (
      <div className="admin-shell flex items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-shell flex items-center justify-center">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-shell flex flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium text-gray-100">This account is not an admin.</p>
        <p className="text-sm text-gray-60">{user.email}</p>
        <Link href="/today" className="text-sm font-medium text-primary-100 hover:underline">
          Back to the app
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-20 pb-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary-100" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-100">
              Super admin
            </p>
            <h1 className="brand-title text-xl font-semibold text-gray-100">
              Alavo backend
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-60">{user.email}</span>
          <Link href="/today" className="font-medium text-primary-100 hover:underline">
            ← App
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}

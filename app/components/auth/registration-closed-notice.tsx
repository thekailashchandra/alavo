import Link from "next/link";
import { REGISTRATION_CLOSED_MESSAGE } from "@/lib/auth/registration";
import { Button } from "@/components/ui/button";

export function RegistrationClosedNotice() {
  return (
    <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/80 p-5 text-amber-950">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-amber-900">
          Sign-ups paused
        </p>
        <p className="text-sm leading-relaxed">{REGISTRATION_CLOSED_MESSAGE}</p>
      </div>
      <Button asChild variant="outline" className="h-11 w-full border-amber-300 bg-white">
        <Link href="/login">Sign in to an existing account</Link>
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { LEGAL } from "@alavo/brand";
import { useAuth } from "@/components/providers/auth-provider";
import { hasValidConsent, type PrivacyConsentRecord } from "@/lib/compliance/consent";
import { parseJson, type User } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const PRIVACY_URL = `${LEGAL.websiteUrl}/privacy`;
const TERMS_URL = `${LEGAL.websiteUrl}/terms`;

export function ConsentGate({
  privacyConsent,
}: {
  privacyConsent: PrivacyConsentRecord | null | undefined;
}) {
  const { fetchWithAuth, setUser } = useAuth();
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (hasValidConsent(privacyConsent)) return null;

  const canSubmit = ageConfirmed && termsAccepted && !submitting;

  const handleAccept = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const res = await fetchWithAuth("/api/settings/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageConfirmed: true,
          method: "consent_gate",
        }),
      });
      if (!res.ok) throw new Error("Could not save consent");
      const user = await parseJson<User>(res);
      setUser(user);
      toast.success("Privacy preferences saved");
    } catch {
      toast.error("Could not save your consent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-xl"
      >
        <h2 id="consent-title" className="text-lg font-semibold">
          Privacy & consent
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Alavo is regulated under the Information Technology Act, 2000, the
          Digital Personal Data Protection Act (DPDP), 2023, and MeitY
          intermediary guidelines. Before you continue, please confirm the
          following.
        </p>

        <div className="mt-5 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="consent-age"
              checked={ageConfirmed}
              onCheckedChange={(v) => setAgeConfirmed(v === true)}
            />
            <Label htmlFor="consent-age" className="text-sm leading-snug font-normal">
              I am {LEGAL.minimumAge} years of age or older and eligible to use
              this service in India.
            </Label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="consent-terms"
              checked={termsAccepted}
              onCheckedChange={(v) => setTermsAccepted(v === true)}
            />
            <Label htmlFor="consent-terms" className="text-sm leading-snug font-normal">
              I have read and agree to the{" "}
              <Link
                href={TERMS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href={PRIVACY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>
              , including processing of my personal data for habit tracking,
              authentication, and optional notifications.
            </Label>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          You may withdraw optional consents anytime in Settings. For grievances
          under the DPDP Act, contact{" "}
          <a
            href={`mailto:${LEGAL.grievanceEmail}`}
            className="text-primary hover:underline"
          >
            {LEGAL.grievanceEmail}
          </a>
          .
        </p>

        <Button
          className="mt-6 h-12 w-full"
          disabled={!canSubmit}
          onClick={() => void handleAccept()}
        >
          {submitting ? "Saving…" : "Accept and continue"}
        </Button>
      </div>
    </div>
  );
}

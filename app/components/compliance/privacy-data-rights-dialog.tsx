"use client";

import { ChevronRight, Shield } from "lucide-react";
import { LEGAL } from "@alavo/brand";
import {
  hasValidConsent,
  type PrivacyConsentRecord,
} from "@/lib/compliance/consent";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PrivacyDataRightsDialogProps = {
  privacyConsent?: PrivacyConsentRecord | Record<string, unknown> | null;
};

export function PrivacyDataRightsDialog({
  privacyConsent,
}: PrivacyDataRightsDialogProps) {
  const consentActive = hasValidConsent(privacyConsent);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-2xl border border-gray-20 bg-white p-4 text-left transition hover:border-primary-30 hover:bg-primary-20/30"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-20 text-primary-100">
            <Shield className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-gray-100">
              Privacy & data rights
            </span>
            <span className="block text-xs text-gray-60">
              DPDP compliance, policies, and grievance contact
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-30" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-100">
            <Shield className="h-5 w-5 text-primary-100" />
            Privacy & data rights
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm text-gray-80">
          <p className="leading-relaxed">
            Alavo processes personal data under the Information Technology Act,
            2000, the Digital Personal Data Protection Act (DPDP), 2023, and
            MeitY intermediary guidelines applicable in India.
          </p>

          <p className="text-xs text-gray-60">
            Consent status:{" "}
            {consentActive
              ? "Active for current policy version"
              : "Update required — you will be prompted on next visit"}
          </p>

          <div className="flex flex-col gap-2 rounded-2xl border border-gray-20 bg-gray-10/40 p-4">
            <a
              href={`${LEGAL.websiteUrl}/privacy`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-100 underline-offset-2 hover:underline"
            >
              Privacy Policy
            </a>
            <a
              href={`${LEGAL.websiteUrl}/terms`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-100 underline-offset-2 hover:underline"
            >
              Terms of Service
            </a>
            <a
              href={`mailto:${LEGAL.grievanceEmail}`}
              className="text-primary-100 underline-offset-2 hover:underline"
            >
              Grievance officer: {LEGAL.grievanceEmail}
            </a>
          </div>

          <p className="text-xs leading-relaxed text-gray-60">
            You may export your data below or erase your account in Advanced
            account options. We respond to grievances within{" "}
            {LEGAL.grievanceResponseDays} days.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

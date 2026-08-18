import { DPDP_POLICY_VERSION } from "@alavo/brand";

export type PrivacyConsentRecord = {
  policyVersion: string;
  termsVersion: string;
  acceptedAt: string;
  ageConfirmed: boolean;
  purposes: {
    essential: true;
    pushNotifications?: boolean;
    emailReports?: boolean;
  };
  method: "signup" | "oauth" | "settings" | "consent_gate";
};

export function buildConsentRecord(
  method: PrivacyConsentRecord["method"],
  opts?: {
    pushNotifications?: boolean;
    emailReports?: boolean;
  }
): PrivacyConsentRecord {
  return {
    policyVersion: DPDP_POLICY_VERSION,
    termsVersion: DPDP_POLICY_VERSION,
    acceptedAt: new Date().toISOString(),
    ageConfirmed: true,
    purposes: {
      essential: true,
      pushNotifications: opts?.pushNotifications,
      emailReports: opts?.emailReports,
    },
    method,
  };
}

export function hasValidConsent(value: unknown): value is PrivacyConsentRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as PrivacyConsentRecord;
  return (
    record.policyVersion === DPDP_POLICY_VERSION &&
    record.ageConfirmed === true &&
    typeof record.acceptedAt === "string" &&
    record.purposes?.essential === true
  );
}

export function clearLocalAppData() {
  if (typeof window === "undefined") return;
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
      const key = sessionStorage.key(i);
      if (key?.startsWith("alavo_")) sessionStorage.removeItem(key);
    }
    localStorage.removeItem("alavo_offline_logs");
    localStorage.removeItem("alavo_pwa_dismissed");
  } catch {
    // ignore storage errors
  }
}

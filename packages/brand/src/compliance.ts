export const DPDP_POLICY_VERSION = "2026-08-18";

export const LEGAL = {
  productName: "Alavo",
  operatorName: "Alavo",
  websiteUrl: "https://alavo.cc",
  appUrl: "https://app.alavo.cc",
  privacyEmail: "privacy@alavo.cc",
  grievanceEmail: "hi@alavo.cc",
  supportEmail: "hi@alavo.cc",
  lastUpdated: "August 18, 2026",
  minimumAge: 18,
  grievanceResponseDays: 30,
} as const;

export const DATA_PROCESSORS = [
  {
    name: "Supabase",
    purpose: "Authentication, session management, and PostgreSQL database hosting",
    data: "Email, authentication tokens, habit and journal data",
  },
  {
    name: "Vercel",
    purpose: "Application hosting, edge delivery, and scheduled jobs",
    data: "Technical logs required to operate the service",
  },
  {
    name: "Google",
    purpose: "Optional Google sign-in (OAuth) and optional website analytics",
    data: "Email and basic profile when you choose Google sign-in; usage data on alavo.cc if analytics consent is given",
  },
  {
    name: "Gmail SMTP (Google)",
    purpose: "Optional habit summary emails you enable in Settings",
    data: "Email address and report content",
  },
] as const;

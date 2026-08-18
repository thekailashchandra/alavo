export type AccountSettings = {
  displayName?: string;
  avatarDataUrl?: string;
  theme?: "indigo" | "light";
  language?: "en" | "hi";
  integrations?: {
    googleCalendar?: boolean;
  };
};

export const DEFAULT_ACCOUNT_SETTINGS: AccountSettings = {
  theme: "indigo",
  language: "en",
  integrations: {
    googleCalendar: false,
  },
};

export function parseAccountSettings(raw: unknown): AccountSettings {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_ACCOUNT_SETTINGS };
  const value = raw as AccountSettings;
  return {
    ...DEFAULT_ACCOUNT_SETTINGS,
    ...value,
    integrations: {
      ...DEFAULT_ACCOUNT_SETTINGS.integrations,
      ...value.integrations,
    },
  };
}

export function displayNameFromEmail(email: string) {
  return email.split("@")[0]?.replace(/[._]/g, " ") ?? "User";
}

export function userInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

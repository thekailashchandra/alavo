export const THEME_STORAGE_KEY = "alavo-theme";

export const UI_THEMES = ["indigo", "light"] as const;
export type UiTheme = (typeof UI_THEMES)[number];

export function isUiTheme(value: unknown): value is UiTheme {
  return value === "indigo" || value === "light";
}

/** Inline script that applies the saved theme before first paint. */
export const THEME_BOOTSTRAP_SCRIPT = `try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");document.documentElement.classList.remove("dark");document.documentElement.dataset.theme=(t==="light"||t==="indigo")?t:"indigo";}catch(e){}`;

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  THEME_STORAGE_KEY,
  isUiTheme,
  type UiTheme,
} from "@alavo/brand";

function applyDomTheme(theme: UiTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.remove("dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore quota / private mode
  }
}

function readStoredTheme(): UiTheme {
  if (typeof document === "undefined") return "indigo";
  const current = document.documentElement.dataset.theme;
  if (isUiTheme(current)) return current;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (isUiTheme(stored)) return stored;
  } catch {
    // ignore
  }
  return "indigo";
}

type ThemeContextValue = {
  theme: UiTheme;
  setTheme: (theme: UiTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "indigo",
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<UiTheme>("indigo");

  useEffect(() => {
    applyDomTheme(readStoredTheme());
    setThemeState(readStoredTheme());
  }, []);

  const setTheme = useCallback((next: UiTheme) => {
    applyDomTheme(next);
    setThemeState(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useSettingsStore, type DisplayTheme } from "@/stores/useSettingsStore";

function systemPreference(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: DisplayTheme) {
  const resolved = theme === "system" ? systemPreference() : theme;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* private mode */
  }
}

interface ThemeContextValue {
  theme: DisplayTheme;
  setTheme: (theme: DisplayTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);
  const persistTheme = useSettingsStore((s) => s.setTheme);

  useEffect(() => {
    applyTheme(theme);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (useSettingsStore.getState().theme === "system") {
        applyTheme("system");
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback(
    (next: DisplayTheme) => {
      persistTheme(next);
    },
    [persistTheme]
  );

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "dark" as DisplayTheme,
      setTheme() {},
    };
  }
  return context;
}

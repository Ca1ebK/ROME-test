"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeModeSetting = "light" | "dark" | "system";
export type ResolvedThemeMode = "light" | "dark";

interface ThemeModeContextValue {
  /** The user's chosen setting: light, dark, or system */
  modeSetting: ThemeModeSetting;
  /** The resolved mode after evaluating system preference */
  resolvedMode: ResolvedThemeMode;
  /** Update the theme mode setting */
  setModeSetting: (mode: ThemeModeSetting) => void;
}

const STORAGE_KEY = "rome_theme_mode";

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(
  undefined
);

function getSystemPreference(): ResolvedThemeMode {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredSetting(): ThemeModeSetting {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function resolveMode(setting: ThemeModeSetting): ResolvedThemeMode {
  if (setting === "system") return getSystemPreference();
  return setting;
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [modeSetting, setModeSettingState] = useState<ThemeModeSetting>(() =>
    getStoredSetting()
  );
  const [systemPreference, setSystemPreference] = useState<ResolvedThemeMode>(
    () => getSystemPreference()
  );

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const setModeSetting = useCallback((mode: ThemeModeSetting) => {
    setModeSettingState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const resolvedMode: ResolvedThemeMode = useMemo(() => {
    if (modeSetting === "system") return systemPreference;
    return modeSetting;
  }, [modeSetting, systemPreference]);

  const value = useMemo(
    () => ({ modeSetting, resolvedMode, setModeSetting }),
    [modeSetting, resolvedMode, setModeSetting]
  );

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within a ThemeModeProvider");
  }
  return ctx;
}

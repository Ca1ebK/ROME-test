"use client";

import { useMemo } from "react";
import { getM3Tokens } from "@/theme";
import { useThemeMode } from "@/theme/ThemeModeContext";

/**
 * Returns M3 design tokens that adapt to the current theme mode.
 * Use this instead of importing `m3Tokens` directly when you need
 * the tokens to respond to light/dark mode changes.
 */
export function useM3Tokens() {
  const { resolvedMode } = useThemeMode();
  return useMemo(() => getM3Tokens(resolvedMode), [resolvedMode]);
}

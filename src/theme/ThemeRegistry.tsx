"use client";

import { useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import NextAppDirEmotionCacheProvider from "./EmotionCache";
import { createAppTheme } from "./theme";
import { ThemeModeProvider, useThemeMode } from "./ThemeModeContext";

interface ThemeRegistryProps {
  children: React.ReactNode;
}

function ThemeRegistryInner({ children }: ThemeRegistryProps) {
  const { resolvedMode } = useThemeMode();

  const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function ThemeRegistry({ children }: ThemeRegistryProps) {
  return (
    <NextAppDirEmotionCacheProvider>
      <ThemeModeProvider>
        <ThemeRegistryInner>{children}</ThemeRegistryInner>
      </ThemeModeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}

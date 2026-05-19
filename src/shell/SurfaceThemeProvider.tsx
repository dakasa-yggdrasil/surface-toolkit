import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { colors, typography } from "../tokens";

// MUI theme built from toolkit design tokens. Centralising it here means
// every surface gets the same Inter font, palette, and spacing without
// having to wire ThemeProvider boilerplate per surface.
export const surfaceTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: colors.semantic.info },
    error: { main: colors.semantic.error },
    warning: { main: colors.semantic.warning },
    success: { main: colors.semantic.success },
    info: { main: colors.semantic.info },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper
    },
    divider: colors.divider
  },
  typography: {
    fontFamily: typography.fontFamily,
    h1: typography.heading.h1,
    h2: typography.heading.h2,
    h3: typography.heading.h3,
    h4: typography.heading.h4,
    body1: typography.body,
    body2: typography.caption
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.background.default,
          color: colors.text.primary,
          margin: 0,
          fontFamily: typography.fontFamily,
          fontSize: typography.body.fontSize,
          lineHeight: typography.body.lineHeight
        },
        a: { color: colors.semantic.info, textDecoration: "none" }
      }
    }
  }
});

export interface SurfaceThemeProviderProps {
  children: ReactNode;
}

// Drop-in wrapper that every surface should mount once near the root of
// its render tree (above any MUI component) so the theme + reset apply.
export function SurfaceThemeProvider({ children }: SurfaceThemeProviderProps) {
  return (
    <ThemeProvider theme={surfaceTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

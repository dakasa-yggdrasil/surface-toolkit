import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { Theme } from "@mui/material";
import { colors, typography } from "../tokens";
import {
  COLOR_SCHEME_ATTRIBUTE,
  SurfaceColorSchemeContext,
  readStoredScheme,
  resolveInitialScheme,
  writeStoredScheme
} from "./colorScheme";
import type { ColorScheme } from "./colorScheme";
import { ThemeToggle } from "./ThemeToggle";

// Dark surface colors — mirror the dark `--*` vars in theme/tokens.css so the
// MUI palette stays in lockstep with the CSS-variable Atelier dark block.
const darkSurface = {
  default: "#171310",
  paper: "#1f1a15",
  textPrimary: "#f4ecdd",
  textSecondary: "#ddd0bb",
  divider: "#362b20"
} as const;

// Build the MUI theme for a given scheme. The light branch keeps exactly the
// values used before dark support existed (back-compat); the dark branch flips
// palette.mode + the background/text/divider roles to the warm dark values.
function buildSurfaceTheme(scheme: ColorScheme): Theme {
  const dark = scheme === "dark";
  return createTheme({
    palette: {
      mode: scheme,
      primary: { main: colors.semantic.info },
      error: { main: colors.semantic.error },
      warning: { main: colors.semantic.warning },
      success: { main: colors.semantic.success },
      info: { main: colors.semantic.info },
      text: {
        primary: dark ? darkSurface.textPrimary : colors.text.primary,
        secondary: dark ? darkSurface.textSecondary : colors.text.secondary,
        disabled: colors.text.disabled
      },
      background: {
        default: dark ? darkSurface.default : colors.background.default,
        paper: dark ? darkSurface.paper : colors.background.paper
      },
      divider: dark ? darkSurface.divider : colors.divider
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
            backgroundColor: dark
              ? darkSurface.default
              : colors.background.default,
            color: dark ? darkSurface.textPrimary : colors.text.primary,
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
}

// MUI theme built from toolkit design tokens. Centralising it here means
// every surface gets the same Inter font, palette, and spacing without
// having to wire ThemeProvider boilerplate per surface. Kept as the LIGHT
// theme for back-compat with anything importing it directly.
export const surfaceTheme = buildSurfaceTheme("light");

// Apply the scheme to <html data-theme="…"> so the CSS-variable dark block
// (theme/tokens.css) takes effect for the whole document, not just the subtree.
function applyHtmlAttribute(scheme: ColorScheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(COLOR_SCHEME_ATTRIBUTE, scheme);
}

export interface SurfaceThemeProviderProps {
  children: ReactNode;
  /**
   * Hide the built-in fixed theme toggle (top-right). Defaults to `false`, so
   * every surface shows the toggle with zero per-screen wiring. Screens that
   * want their own placement can hide it and render <ThemeToggle/> inline.
   */
  hideToggle?: boolean;
}

// Drop-in wrapper that every surface should mount once near the root of
// its render tree (above any MUI component) so the theme + reset apply.
export function SurfaceThemeProvider({
  children,
  hideToggle = false
}: SurfaceThemeProviderProps) {
  const [scheme, setSchemeState] = useState<ColorScheme>(resolveInitialScheme);

  // Reflect the scheme onto <html> on mount and whenever it changes.
  useEffect(() => {
    applyHtmlAttribute(scheme);
  }, [scheme]);

  // Follow the OS preference ONLY while there is no manual override. The
  // listener no-ops as soon as something has been persisted to localStorage.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      if (readStoredScheme()) return; // manual override wins — ignore the OS
      setSchemeState(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const setScheme = useCallback((next: ColorScheme) => {
    writeStoredScheme(next); // persist the manual override
    setSchemeState(next);
    applyHtmlAttribute(next);
  }, []);

  const toggle = useCallback(() => {
    setSchemeState((prev) => {
      const next: ColorScheme = prev === "dark" ? "light" : "dark";
      writeStoredScheme(next);
      applyHtmlAttribute(next);
      return next;
    });
  }, []);

  const theme = useMemo(() => buildSurfaceTheme(scheme), [scheme]);

  const ctx = useMemo(
    () => ({ scheme, setScheme, toggle }),
    [scheme, setScheme, toggle]
  );

  return (
    <SurfaceColorSchemeContext.Provider value={ctx}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {!hideToggle && <ThemeToggle fixed />}
        {children}
      </ThemeProvider>
    </SurfaceColorSchemeContext.Provider>
  );
}

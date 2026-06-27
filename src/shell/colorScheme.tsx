import { createContext, useContext } from "react";

/** The two color schemes a surface can render in. */
export type ColorScheme = "dark" | "light";

/** Value exposed by the surface color-scheme context. */
export interface SurfaceColorSchemeContextValue {
  /** The currently-applied scheme. */
  scheme: ColorScheme;
  /** Set an explicit scheme; persists a manual override. */
  setScheme: (scheme: ColorScheme) => void;
  /** Flip between light and dark; persists a manual override. */
  toggle: () => void;
}

/** localStorage key holding a manual `"dark"`/`"light"` override. */
export const COLOR_SCHEME_STORAGE_KEY = "dakasa-surface-color-scheme";

/** HTML attribute (on `<html>`) that the CSS dark block keys off. */
export const COLOR_SCHEME_ATTRIBUTE = "data-theme";

/**
 * Context default: a sane no-op so a stray `useSurfaceColorScheme()` outside the
 * provider never crashes a surface. It reports the safe `"light"` default and
 * its mutators do nothing (rather than throwing).
 */
const fallbackValue: SurfaceColorSchemeContextValue = {
  scheme: "light",
  setScheme: () => {},
  toggle: () => {}
};

export const SurfaceColorSchemeContext =
  createContext<SurfaceColorSchemeContextValue>(fallbackValue);

/**
 * Access the surface color scheme + its setters.
 *
 * Used outside a SurfaceThemeProvider it returns a no-op default (scheme
 * `"light"`) instead of throwing, so a stray usage degrades gracefully.
 */
export function useSurfaceColorScheme(): SurfaceColorSchemeContextValue {
  return useContext(SurfaceColorSchemeContext);
}

/** Returns true only when `value` is a valid `ColorScheme`. */
function isColorScheme(value: unknown): value is ColorScheme {
  return value === "dark" || value === "light";
}

/**
 * Read a persisted manual override from localStorage, if any. Returns
 * `undefined` when unset, invalid, or when storage is unavailable (SSR /
 * privacy mode). This being `undefined` is what keeps the system listener live.
 */
export function readStoredScheme(): ColorScheme | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const stored = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
    return isColorScheme(stored) ? stored : undefined;
  } catch {
    return undefined;
  }
}

/** Persist a manual override (best-effort; swallows storage failures). */
export function writeStoredScheme(scheme: ColorScheme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, scheme);
  } catch {
    /* ignore — storage unavailable */
  }
}

/**
 * Resolve the scheme to use at mount, in precedence order:
 *   1. a persisted manual override in localStorage, else
 *   2. a `?theme=dark|light` URL query param, else
 *   3. the OS preference via `prefers-color-scheme`.
 * SSR / no-window guard → `"light"`.
 */
export function resolveInitialScheme(): ColorScheme {
  if (typeof window === "undefined") return "light";

  const stored = readStoredScheme();
  if (stored) return stored;

  try {
    const param = new URLSearchParams(window.location.search).get("theme");
    if (isColorScheme(param)) return param;
  } catch {
    /* malformed URL — fall through to media query */
  }

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

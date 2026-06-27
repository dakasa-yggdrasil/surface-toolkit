import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

// jsdom does not implement matchMedia. Provide a controllable default mock so
// SurfaceThemeProvider (and anything reading prefers-color-scheme) works in
// tests. Individual tests can override window.matchMedia for specific cases.
type MqlListener = (e: MediaQueryListEvent) => void;

export function mockMatchMedia(matches: boolean) {
  const listeners = new Set<MqlListener>();
  const mql = {
    matches,
    media: "(prefers-color-scheme: dark)",
    onchange: null,
    addEventListener: (_: string, cb: MqlListener) => listeners.add(cb),
    removeEventListener: (_: string, cb: MqlListener) => listeners.delete(cb),
    // legacy API
    addListener: (cb: MqlListener) => listeners.add(cb),
    removeListener: (cb: MqlListener) => listeners.delete(cb),
    dispatchEvent: () => true
  };
  window.matchMedia = vi.fn().mockImplementation(() => mql) as typeof window.matchMedia;
  return {
    mql,
    // Emit a system-preference change to all registered listeners.
    emit: (nextMatches: boolean) => {
      mql.matches = nextMatches;
      listeners.forEach((cb) =>
        cb({ matches: nextMatches } as MediaQueryListEvent)
      );
    }
  };
}

beforeEach(() => {
  // Default: system prefers light. Tests opt into dark explicitly.
  mockMatchMedia(false);
});

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

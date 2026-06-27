import type { CSSProperties } from "react";
import { useSurfaceColorScheme } from "./colorScheme";

export interface ThemeToggleProps {
  /**
   * When true, the toggle floats fixed in the top-right corner (the default
   * SurfaceThemeProvider placement). When false, it renders inline so a screen
   * can position it wherever it likes. Defaults to `false` (inline).
   */
  fixed?: boolean;
  /** Extra styles merged onto the button (e.g. inline placement tweaks). */
  style?: CSSProperties;
  className?: string;
}

const SunIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

/**
 * Small, token-styled sun/moon button that flips the surface color scheme.
 *
 * Rendered fixed in the top-right by SurfaceThemeProvider by default (every
 * surface gets it for free), but exported so screens can drop it inline too.
 */
export function ThemeToggle({ fixed = false, style, className }: ThemeToggleProps) {
  const { scheme, toggle } = useSurfaceColorScheme();
  const goingDark = scheme === "light";
  const label = goingDark ? "Mudar para tema escuro" : "Mudar para tema claro";

  const baseStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    padding: 0,
    borderRadius: 999,
    border: "1px solid var(--line)",
    background: "var(--sand)",
    color: "var(--ink)",
    boxShadow: "var(--sh-soft)",
    cursor: "pointer",
    lineHeight: 0,
    transition: "background 120ms ease, border-color 120ms ease, transform 120ms ease",
    ...(fixed
      ? ({ position: "fixed", top: 12, right: 12, zIndex: 50 } as const)
      : null),
    ...style
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={className}
      style={baseStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--sand2)";
        e.currentTarget.style.borderColor = "var(--bronze)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--sand)";
        e.currentTarget.style.borderColor = "var(--line)";
      }}
    >
      {goingDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

/*
 * Atelier Cálido — warm DaKasa skin (TS mirror of tokens.css).
 *
 * This object is the source of truth for JS / inline-SVG charts that need to
 * read token values at runtime (where CSS custom properties are awkward to
 * resolve). It MUST stay byte-for-byte in sync with src/theme/tokens.css.
 *
 * The CSS custom properties are scoped to a `.atelier` root class; consumers
 * opt into the warm theme by adding that class to their outermost element.
 */

/** Color roles. */
export const color = {
  // ink / body / muted
  ink: "#3c2e20",
  body: "#4a3b2c",
  mut: "#a08c72",
  // surfaces
  cream: "#fdfaf4",
  sand: "#fbf7ef",
  sand2: "#f6ecda",
  // accents
  honey: "#c97f2c",
  honey2: "#e8a948",
  bronze: "#b08038",
  bronze2: "#9a6f2c",
  // hairline
  line: "#f0e3ce",
  // status (warm-tuned)
  ok: "#6f9440",
  ok2: "#8fae57",
  warn: "#b07d18",
  warn2: "#e8a948",
  crit: "#b8531f",
  crit2: "#c0612a"
} as const;

/** Spacing scale (8 steps, px). */
export const spacing = {
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "24px",
  6: "32px",
  7: "40px",
  8: "56px"
} as const;

/** Corner radii. */
export const radius = {
  sm: "8px",
  md: "14px",
  lg: "16px"
} as const;

/** Soft elevation shadow. */
export const shadow = {
  soft: "0 10px 30px -20px rgba(120, 86, 40, .4)"
} as const;

/** Type scale + families. */
export const typography = {
  heading: "'Fraunces', Georgia, serif",
  body: "'Inter', system-ui, sans-serif",
  size: {
    xs: "11px",
    sm: "12.5px",
    md: "14px",
    lg: "16px",
    xl: "21px",
    "2xl": "27px"
  }
} as const;

/**
 * The full Atelier token set as one object so JS/SVG consumers can read any
 * value without importing each map separately.
 */
export const tokens = {
  color,
  spacing,
  radius,
  shadow,
  typography
} as const;

/** CSS-variable names keyed by the same roles, for `var(--…)` ergonomics. */
export const cssVars = {
  color: {
    ink: "var(--ink)",
    body: "var(--body)",
    mut: "var(--mut)",
    cream: "var(--cream)",
    sand: "var(--sand)",
    sand2: "var(--sand2)",
    honey: "var(--honey)",
    honey2: "var(--honey2)",
    bronze: "var(--bronze)",
    bronze2: "var(--bronze2)",
    line: "var(--line)",
    ok: "var(--ok)",
    ok2: "var(--ok2)",
    warn: "var(--warn)",
    warn2: "var(--warn2)",
    crit: "var(--crit)",
    crit2: "var(--crit2)"
  },
  spacing: {
    1: "var(--sp-1)",
    2: "var(--sp-2)",
    3: "var(--sp-3)",
    4: "var(--sp-4)",
    5: "var(--sp-5)",
    6: "var(--sp-6)",
    7: "var(--sp-7)",
    8: "var(--sp-8)"
  },
  radius: { sm: "var(--r-sm)", md: "var(--r-md)", lg: "var(--r-lg)" },
  shadow: { soft: "var(--sh-soft)" },
  typography: {
    heading: "var(--font-heading)",
    body: "var(--font-body)",
    size: {
      xs: "var(--fs-xs)",
      sm: "var(--fs-sm)",
      md: "var(--fs-md)",
      lg: "var(--fs-lg)",
      xl: "var(--fs-xl)",
      "2xl": "var(--fs-2xl)"
    }
  }
} as const;

export type AtelierColor = keyof typeof color;
export type AtelierSpacing = keyof typeof spacing;
export type AtelierRadius = keyof typeof radius;
export type AtelierTokens = typeof tokens;

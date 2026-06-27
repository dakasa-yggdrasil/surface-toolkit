// Atelier Cálido stylesheet — emitted to dist/styles.css by the lib build and
// exposed via the package's "./styles" export. Vitest no-ops CSS imports
// (css: false), so this is safe in tests too.
import "./theme/tokens.css";

// Legacy MUI-era design tokens (colors/spacing/typography/brand + `tokens`).
// Kept for back-compat with existing surfaces.
export * from "./tokens";

// Atelier Cálido — the warm DaKasa design language. Its `tokens` object is the
// canonical going-forward token set, so it intentionally shadows the legacy
// `tokens` export above. The other Atelier names are namespaced to avoid
// clobbering the legacy `spacing`/`typography` root exports.
export { tokens } from "./theme";
export {
  color,
  radius,
  shadow,
  cssVars,
  spacing as atelierSpacing,
  typography as atelierTypography
} from "./theme";
export type {
  AtelierColor,
  AtelierSpacing,
  AtelierRadius,
  AtelierTokens
} from "./theme";

// Label helpers.
export * from "./util";

export * from "./icons";
export * from "./components";
export * from "./hooks";
export * from "./tabs";
export * from "./shell";

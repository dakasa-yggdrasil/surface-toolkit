import type { CSSProperties, ReactNode } from "react";
import { displayCase } from "../util/displayCase";

export type ChipTone = "neutral" | "team" | "ok" | "warn" | "crit";

export interface ChipProps {
  /** Optional leading icon. Rendered in a fixed, centered box. */
  icon?: ReactNode;
  /** Label text. Run through {@link displayCase} unless `preserveCase`. */
  label: string;
  /** Warm tone. Defaults to `neutral`. */
  tone?: ChipTone;
  /** Skip displayCase and render the label verbatim (canonical names). */
  preserveCase?: boolean;
}

/**
 * Tone -> { background, foreground, border } using Atelier CSS variables, so
 * the chip recolors automatically inside an `.atelier` root.
 */
const TONE_STYLES: Record<ChipTone, CSSProperties> = {
  neutral: { background: "var(--sand)", color: "var(--body)", borderColor: "var(--line)" },
  team: { background: "var(--sand2)", color: "var(--bronze2)", borderColor: "var(--line)" },
  ok: { background: "var(--sand)", color: "var(--ok)", borderColor: "var(--ok2)" },
  warn: { background: "var(--sand)", color: "var(--warn)", borderColor: "var(--warn2)" },
  crit: { background: "var(--sand)", color: "var(--crit)", borderColor: "var(--crit2)" }
};

/**
 * Fixed icon box. `inline-flex` + `align-items/justify-content: center` plus a
 * fixed square size keeps the icon optically centered with the text baseline
 * regardless of glyph metrics — the hard requirement that the old mockups
 * missed (decentered icons).
 */
const ICON_BOX: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "1em",
  height: "1em",
  flex: "0 0 auto",
  lineHeight: 0
};

export function Chip({ icon, label, tone = "neutral", preserveCase }: ChipProps) {
  const text = preserveCase ? label : displayCase(label);
  const toneStyle = TONE_STYLES[tone];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--sp-2)",
        padding: "var(--sp-1) var(--sp-3)",
        borderRadius: "var(--r-sm)",
        border: "1px solid",
        fontFamily: "var(--font-body)",
        fontSize: "var(--fs-sm)",
        fontWeight: 500,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        ...toneStyle
      }}
    >
      {icon != null ? <span style={ICON_BOX}>{icon}</span> : null}
      <span>{text}</span>
    </span>
  );
}

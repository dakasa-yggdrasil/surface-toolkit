import type { CSSProperties } from "react";
import { displayCase } from "../util/displayCase";

export type PillTone = "neutral" | "team" | "ok" | "warn" | "crit";

export interface PillProps {
  /** Label text. Run through {@link displayCase} unless `preserveCase`. */
  label: string;
  /** Warm status tone. Defaults to `neutral`. */
  tone?: PillTone;
  /** Skip displayCase and render the label verbatim. */
  preserveCase?: boolean;
}

/**
 * Tone -> tinted text + faint warm background. A pill is a smaller, status-only
 * variant of {@link Chip} (no icon slot), so it leans on color, not a glyph.
 */
const TONE_STYLES: Record<PillTone, CSSProperties> = {
  neutral: { background: "var(--sand2)", color: "var(--mut)" },
  team: { background: "var(--sand2)", color: "var(--bronze2)" },
  ok: { background: "var(--sand2)", color: "var(--ok)" },
  warn: { background: "var(--sand2)", color: "var(--warn)" },
  crit: { background: "var(--sand2)", color: "var(--crit)" }
};

export function Pill({ label, tone = "neutral", preserveCase }: PillProps) {
  const text = preserveCase ? label : displayCase(label);

  return (
    <span
      style={{
        // Same centering discipline as Chip so dots / text never drift.
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--sp-1)",
        padding: "1px var(--sp-2)",
        borderRadius: "999px",
        fontFamily: "var(--font-body)",
        fontSize: "var(--fs-xs)",
        fontWeight: 600,
        letterSpacing: "0.02em",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
        ...TONE_STYLES[tone]
      }}
    >
      {text}
    </span>
  );
}

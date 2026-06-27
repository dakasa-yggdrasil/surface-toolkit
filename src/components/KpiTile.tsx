import type { CSSProperties, ReactNode } from "react";

export type KpiDeltaDir = "up" | "down" | "flat";

export interface KpiDelta {
  dir: KpiDeltaDir;
  text: string;
}

export interface KpiTileProps {
  /** Small uppercase amber label above the value. */
  eyebrow: string;
  /** The headline figure (Fraunces, large). */
  value: ReactNode;
  /** Optional trend indicator. */
  delta?: KpiDelta;
  /** Optional chart / sparkline slot rendered below the value. */
  chart?: ReactNode;
}

const DELTA_GLYPH: Record<KpiDeltaDir, string> = {
  up: "↑", // ↑
  down: "↓", // ↓
  flat: "→" // →
};

/** Warm up/down/flat colors. */
const DELTA_COLOR: Record<KpiDeltaDir, string> = {
  up: "var(--ok)",
  down: "var(--crit)",
  flat: "var(--mut)"
};

const DELTA_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--sp-1)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--fs-sm)",
  fontWeight: 600
};

export function KpiTile({ eyebrow, value, delta, chart }: KpiTileProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--sp-2)",
        padding: "var(--sp-4) var(--sp-5)",
        background: "var(--cream)",
        border: "1px solid var(--line)",
        borderRadius: "var(--r-md)",
        boxShadow: "var(--sh-soft)"
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--fs-xs)",
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--honey)"
        }}
      >
        {eyebrow}
      </span>

      <span
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "var(--fs-2xl)",
          fontWeight: 600,
          lineHeight: 1.05,
          color: "var(--ink)"
        }}
      >
        {value}
      </span>

      {delta != null ? (
        <span style={{ ...DELTA_STYLE, color: DELTA_COLOR[delta.dir] }}>
          <span aria-hidden="true">{DELTA_GLYPH[delta.dir]}</span>
          <span>{delta.text}</span>
        </span>
      ) : null}

      {chart != null ? <div style={{ marginTop: "var(--sp-2)" }}>{chart}</div> : null}
    </div>
  );
}

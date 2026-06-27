import type { CSSProperties } from "react";
import { color } from "../../theme/tokens";

export interface BarDatum {
  label: string;
  value: number;
  /** Bar fill (token var or hex). Defaults to honey. */
  tone?: string;
}

export interface BarsProps {
  data: BarDatum[];
  /** Override the value that maps to a full-length bar. Defaults to max(data). */
  max?: number;
  /** "horizontal" (default) stacks rows top-to-bottom; "vertical" draws columns. */
  orientation?: "horizontal" | "vertical";
  /** Rendered height in px. Width is always 100% of the container. */
  height?: number;
}

const VB_W = 240;
const PAD = 4;
const LABEL_W = 56; // gutter for horizontal labels
const GAP = 4;

/**
 * Simple bar chart for pass-rate / age-distribution style data. Horizontal by
 * default (labelled rows); vertical for column comparisons. Dependency-free,
 * fluid (viewBox + `width:100%`), token-themed.
 */
export function Bars({ data, max, orientation = "horizontal", height = 140 }: BarsProps) {
  const peak = Math.max(1, max ?? Math.max(0, ...data.map((d) => d.value)));
  const vbH = orientation === "horizontal" ? Math.max(40, data.length * 22 + PAD * 2) : 100;

  const svgStyle: CSSProperties = {
    width: "100%",
    height: `${height}px`,
    display: "block"
  };

  return (
    <svg viewBox={`0 0 ${VB_W} ${vbH}`} preserveAspectRatio="xMidYMid meet" style={svgStyle} role="img">
      {orientation === "horizontal"
        ? renderHorizontal(data, peak, vbH)
        : renderVertical(data, peak, vbH)}
    </svg>
  );
}

function renderHorizontal(data: BarDatum[], peak: number, vbH: number) {
  const plotW = VB_W - LABEL_W - PAD;
  const rowH = (vbH - PAD * 2) / Math.max(1, data.length);
  const barH = rowH - GAP;
  return data.map((d, i) => {
    const y = PAD + i * rowH;
    const w = (d.value / peak) * plotW;
    const fill = d.tone ?? color.honey;
    return (
      <g key={`${d.label}-${i}`}>
        <text
          x={4}
          y={y + barH / 2}
          fontSize={7}
          fill={color.body}
          fontFamily="var(--font-body)"
          dominantBaseline="middle"
        >
          {d.label}
        </text>
        <rect
          data-role="bar"
          x={LABEL_W}
          y={y}
          width={Math.max(0, w)}
          height={Math.max(0, barH)}
          rx={2}
          fill={fill}
          fillOpacity={0.85}
        />
        <text
          x={LABEL_W + Math.max(0, w) + 3}
          y={y + barH / 2}
          fontSize={6.5}
          fill={color.mut}
          fontFamily="var(--font-body)"
          dominantBaseline="middle"
        >
          {d.value}
        </text>
      </g>
    );
  });
}

function renderVertical(data: BarDatum[], peak: number, vbH: number) {
  const plotH = vbH - PAD * 2 - 8; // reserve a strip for labels
  const colW = (VB_W - PAD * 2) / Math.max(1, data.length);
  const barW = colW - GAP;
  return data.map((d, i) => {
    const h = (d.value / peak) * plotH;
    const x = PAD + i * colW;
    const y = PAD + plotH - h;
    const fill = d.tone ?? color.honey;
    return (
      <g key={`${d.label}-${i}`}>
        <rect
          data-role="bar"
          x={x}
          y={y}
          width={Math.max(0, barW)}
          height={Math.max(0, h)}
          rx={2}
          fill={fill}
          fillOpacity={0.85}
        />
        <text
          x={x + barW / 2}
          y={vbH - 2}
          fontSize={6.5}
          fill={color.mut}
          fontFamily="var(--font-body)"
          textAnchor="middle"
        >
          {d.label}
        </text>
      </g>
    );
  });
}

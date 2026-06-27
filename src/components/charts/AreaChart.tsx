import type { CSSProperties } from "react";
import { color } from "../../theme/tokens";

export interface AreaSeries {
  /** PRs opened per bucket. */
  opened: number[];
  /** PRs merged per bucket. */
  merged: number[];
}

export interface AreaChartProps {
  /** Two aligned series — opened vs merged — for the demand chart. */
  series: AreaSeries;
  /** Optional x-axis labels (rendered under the plot). */
  labels?: string[];
  /** Render a small legend above the plot. */
  legend?: boolean;
  /** Rendered height in px. Width is always 100% of the container. */
  height?: number;
}

// Warm pair: opened in honey, merged in ok-green (the "demand vs throughput"
// read most surfaces want).
const OPENED_STROKE = color.honey;
const OPENED_FILL = color.honey2;
const MERGED_STROKE = color.ok;
const MERGED_FILL = color.ok2;

const VB_W = 240;
const VB_H = 80;
const PAD = 6;

/**
 * Two stacked area + line series (opened vs merged). Dependency-free, fluid
 * (viewBox + `width:100%`), token-themed. Optional legend + x labels.
 */
export function AreaChart({
  series,
  labels,
  legend,
  height = 160
}: AreaChartProps) {
  const max = Math.max(1, ...series.opened, ...series.merged);

  const openedPts = toPoints(series.opened, max);
  const mergedPts = toPoints(series.merged, max);

  const svgStyle: CSSProperties = { width: "100%", height: "auto", display: "block" };

  return (
    <div style={{ width: "100%" }}>
      {legend ? (
        <div
          style={{
            display: "flex",
            gap: "var(--sp-4)",
            marginBottom: "var(--sp-2)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--fs-xs)",
            color: "var(--mut)"
          }}
        >
          <LegendSwatch color={OPENED_STROKE} label="Opened" />
          <LegendSwatch color={MERGED_STROKE} label="Merged" />
        </div>
      ) : null}

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        style={{ ...svgStyle, height: `${height}px` }}
        role="img"
      >
        {/* merged underneath, opened on top so demand reads as the envelope */}
        <path d={areaPath(mergedPts)} fill={MERGED_FILL} fillOpacity={0.18} stroke="none" />
        <path d={areaPath(openedPts)} fill={OPENED_FILL} fillOpacity={0.18} stroke="none" />

        <polyline
          points={mergedPts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={MERGED_STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={openedPts.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke={OPENED_STROKE}
          strokeWidth={2}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {labels && labels.length > 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "var(--sp-1)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--fs-xs)",
            color: "var(--mut)"
          }}
        >
          {labels.map((l, i) => (
            <span key={`${l}-${i}`}>{l}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LegendSwatch({ color: c, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--sp-1)" }}>
      <span
        aria-hidden="true"
        style={{ width: 10, height: 10, borderRadius: 2, background: c, display: "inline-block" }}
      />
      {label}
    </span>
  );
}

function toPoints(data: number[], max: number): { x: number; y: number }[] {
  if (data.length === 0) return [];
  const innerW = VB_W - PAD * 2;
  const innerH = VB_H - PAD * 2;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;
  return data.map((v, i) => ({
    x: PAD + stepX * i,
    y: PAD + innerH - (v / max) * innerH
  }));
}

function areaPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  const baseY = VB_H - PAD;
  const head = `M ${points[0].x} ${baseY}`;
  const line = points.map((p) => `L ${p.x} ${p.y}`).join(" ");
  const tail = `L ${points[points.length - 1].x} ${baseY} Z`;
  return `${head} ${line} ${tail}`;
}

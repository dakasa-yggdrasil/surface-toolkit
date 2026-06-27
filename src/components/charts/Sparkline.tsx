import type { CSSProperties } from "react";
import { color } from "../../theme/tokens";

export type SparkTone = "honey" | "ok" | "warn" | "crit" | "bronze";

export interface SparklineProps {
  /** The series to plot. An empty array renders an empty (but valid) svg. */
  data: number[];
  /** Warm stroke tone. Defaults to `honey`. */
  tone?: SparkTone;
  /** Rendered height in px. Width is always 100% of the container. */
  height?: number;
  /** Stroke width in viewBox units. */
  strokeWidth?: number;
}

const TONE_STROKE: Record<SparkTone, string> = {
  honey: color.honey,
  ok: color.ok,
  warn: color.warn,
  crit: color.crit,
  bronze: color.bronze
};

// Internal viewBox coordinate space. The svg is fluid (width:100%) and scales
// this space to fit, so these are unitless design coordinates, not pixels.
const VB_W = 120;
const VB_H = 32;
const PAD = 3;

/**
 * A compact, dependency-free trend line: a single polyline plus a dot at the
 * latest point. Responsive via viewBox + `width:100%`; height is caller-set.
 */
export function Sparkline({
  data,
  tone = "honey",
  height = 36,
  strokeWidth = 2
}: SparklineProps) {
  const stroke = TONE_STROKE[tone];
  // The svg is stretched non-uniformly (preserveAspectRatio="none") to fill the
  // container width at a short height. A polyline survives that fine, but ANY
  // shape with intrinsic aspect — a <circle> — would be squashed into an ugly
  // ellipse. So the "latest point" marker is NOT drawn in the svg; it's a CSS
  // dot overlaid at the point's relative position, which stays perfectly round
  // regardless of the stretch. (See the distortion guard in charts.test.tsx.)
  const svgStyle: CSSProperties = {
    width: "100%",
    height: "100%",
    display: "block",
    overflow: "visible"
  };

  const points = toPoints(data);
  const last = points.length > 0 ? points[points.length - 1] : null;

  return (
    <div
      data-role="spark"
      style={{ position: "relative", width: "100%", height: `${height}px`, overflow: "visible" }}
    >
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
        style={svgStyle}
        role="img"
      >
        {points.length > 0 ? (
          <polyline
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>
      {last ? (
        <span
          data-role="spark-dot"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: `${(last.x / VB_W) * 100}%`,
            top: `${(last.y / VB_H) * 100}%`,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: stroke,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none"
          }}
        />
      ) : null}
    </div>
  );
}

function toPoints(data: number[]): { x: number; y: number }[] {
  if (data.length === 0) return [];
  const innerW = VB_W - PAD * 2;
  const innerH = VB_H - PAD * 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  return data.map((v, i) => ({
    x: PAD + stepX * i,
    // invert: higher value -> smaller y (top of the box)
    y: PAD + innerH - ((v - min) / span) * innerH
  }));
}

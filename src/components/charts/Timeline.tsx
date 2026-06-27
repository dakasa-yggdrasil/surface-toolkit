import type { CSSProperties } from "react";
import { color } from "../../theme/tokens";

export interface TimelineBar {
  /** Inclusive start week index (0-based). */
  startWeek: number;
  /** Exclusive end week index. */
  endWeek: number;
  /** Bar fill (token var or hex). Defaults to honey. */
  tone?: string;
  /** Render a milestone diamond at endWeek instead of a span bar. */
  milestone?: boolean;
}

export interface TimelineRow {
  label: string;
  bars: TimelineBar[];
}

export interface TimelineProps {
  rows: TimelineRow[];
  /** Total number of weeks on the x-axis. */
  weeks: number;
  /** Draw a vertical "today" marker at this week index. */
  todayWeek?: number;
  /** Per-row height in px (drives the overall svg height). */
  rowHeight?: number;
}

const VB_W = 240;
const LABEL_W = 64; // viewBox units reserved for the left label gutter
const AXIS_H = 14; // top weeks axis band
const BAR_INSET = 4; // vertical inset of the bar within its row
const LABEL_FS = 7; // row-label font size (viewBox units)
const LABEL_PAD = 6; // gap between the label and the plot's left edge
// Nominal advance width of one label glyph in viewBox units. SVG <text> can't
// auto-ellipsis, so we truncate the STRING to whatever fits the gutter. Sized
// a touch generously (~0.62em) so we never bleed past LABEL_W into the bars.
const LABEL_CHAR_W = LABEL_FS * 0.62;
// How many chars (incl. the trailing ellipsis) fit in the usable gutter.
const MAX_LABEL_CHARS = Math.max(1, Math.floor((LABEL_W - LABEL_PAD) / LABEL_CHAR_W));

/**
 * Fit a row label into the left gutter: if it's wider than {@link MAX_LABEL_CHARS},
 * hard-truncate the string and append an ellipsis so it never overlaps the bars
 * (the full text is preserved separately in a <title> for hover).
 */
function fitLabel(label: string): string {
  if (label.length <= MAX_LABEL_CHARS) return label;
  return label.slice(0, Math.max(0, MAX_LABEL_CHARS - 1)) + "…";
}

/**
 * A horizontal roadmap: a weeks axis, one horizontal bar per task span,
 * milestone diamonds, and a "today" vertical line. Dependency-free, fluid
 * (viewBox + `width:100%`), token-themed.
 */
export function Timeline({ rows, weeks, todayWeek, rowHeight = 28 }: TimelineProps) {
  const plotW = VB_W - LABEL_W;
  const weekW = plotW / Math.max(1, weeks);
  const vbH = AXIS_H + rows.length * rowHeight;

  const xForWeek = (w: number) => LABEL_W + w * weekW;

  const svgStyle: CSSProperties = {
    width: "100%",
    height: `${vbH * 2}px`,
    display: "block"
  };

  // A sparse set of week ticks (every ~quarter of the span) to avoid clutter.
  const tickEvery = Math.max(1, Math.round(weeks / 6));
  const ticks: number[] = [];
  for (let w = 0; w <= weeks; w += tickEvery) ticks.push(w);

  return (
    <svg viewBox={`0 0 ${VB_W} ${vbH}`} preserveAspectRatio="xMidYMid meet" style={svgStyle} role="img">
      {/* weeks axis */}
      {ticks.map((w) => (
        <g key={`tick-${w}`}>
          <line
            x1={xForWeek(w)}
            y1={AXIS_H}
            x2={xForWeek(w)}
            y2={vbH}
            stroke={color.line}
            strokeWidth={0.5}
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={xForWeek(w)}
            y={AXIS_H - 4}
            fontSize={6}
            fill={color.mut}
            fontFamily="var(--font-body)"
            textAnchor="middle"
          >
            S{w}
          </text>
        </g>
      ))}

      {/* rows */}
      {rows.map((row, ri) => {
        const rowTop = AXIS_H + ri * rowHeight;
        const barY = rowTop + BAR_INSET;
        const barH = rowHeight - BAR_INSET * 2;
        return (
          <g key={`row-${ri}`}>
            {/* Right-aligned in the gutter so it sits cleanly to the left of
                the plot; long labels are string-truncated (SVG can't ellipsis)
                and carry the full text in a <title> for hover. */}
            <text
              data-role="row-label"
              x={LABEL_W - LABEL_PAD}
              y={rowTop + rowHeight / 2}
              fontSize={LABEL_FS}
              fill={color.body}
              fontFamily="var(--font-body)"
              textAnchor="end"
              dominantBaseline="middle"
            >
              <title>{row.label}</title>
              {fitLabel(row.label)}
            </text>
            {row.bars.map((bar, bi) => {
              const x = xForWeek(bar.startWeek);
              const w = Math.max(0, (bar.endWeek - bar.startWeek) * weekW);
              const fill = bar.tone ?? color.honey;
              if (bar.milestone) {
                const cx = xForWeek(bar.endWeek);
                const cy = rowTop + rowHeight / 2;
                const s = barH / 2;
                return (
                  <polygon
                    key={`m-${ri}-${bi}`}
                    data-role="milestone"
                    points={`${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`}
                    fill={fill}
                    stroke={color.bronze2}
                    strokeWidth={0.5}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              }
              return (
                <rect
                  key={`b-${ri}-${bi}`}
                  data-role="bar"
                  x={x}
                  y={barY}
                  width={w}
                  height={barH}
                  rx={2}
                  fill={fill}
                  fillOpacity={0.85}
                />
              );
            })}
          </g>
        );
      })}

      {/* today marker */}
      {todayWeek != null ? (
        <line
          data-role="today"
          x1={xForWeek(todayWeek)}
          y1={AXIS_H - 2}
          x2={xForWeek(todayWeek)}
          y2={vbH}
          stroke={color.crit}
          strokeWidth={1}
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
    </svg>
  );
}

import type { CSSProperties } from "react";

export interface SkeletonProps {
  /** Width of the placeholder bar. Defaults to `"100%"`. */
  width?: string | number;
  /** Height of the placeholder bar. Defaults to `12`. */
  height?: string | number;
  /** Corner radius. Defaults to `"var(--r-sm)"`. */
  radius?: string | number;
}

/**
 * The keyframe name backing the shimmer sweep. Exported so consumers (and tests)
 * can reference the animation by name.
 */
export const SKELETON_ANIMATION_NAME = "dk-skeleton-shimmer";

const STYLE_ID = `${SKELETON_ANIMATION_NAME}-style`;

/**
 * A warm gradient sweep (sand2 → cream → sand2) slid left-to-right over a 200%
 * background. `prefers-reduced-motion` swaps the sweep for a gentle opacity
 * pulse on a flat warm base, so motion-sensitive users still get a "loading"
 * affordance without the moving gradient.
 */
const KEYFRAMES = `
@keyframes ${SKELETON_ANIMATION_NAME} {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes ${SKELETON_ANIMATION_NAME}-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}
.dk-skeleton {
  display: inline-block;
  vertical-align: middle;
  background-color: var(--sand2, #f6ecda);
  background-image: linear-gradient(
    90deg,
    var(--sand2, #f6ecda) 0%,
    var(--cream, #fdfaf4) 50%,
    var(--sand2, #f6ecda) 100%
  );
  background-size: 200% 100%;
  background-repeat: no-repeat;
  animation: ${SKELETON_ANIMATION_NAME} 1.4s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .dk-skeleton {
    background-image: none;
    background-color: var(--sand2, #f6ecda);
    animation: ${SKELETON_ANIMATION_NAME}-pulse 1.8s ease-in-out infinite;
  }
}
`;

/**
 * Inject the keyframes + base class exactly once per document. Guarded by a
 * stable element id so multiple Skeletons (or re-renders) don't duplicate the
 * rule. No-op when there is no `document` (SSR-safe).
 */
function ensureStyleInjected(): void {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = KEYFRAMES;
  document.head.appendChild(el);
}

function px(value: string | number): string {
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * An animated, token-themed loading placeholder. Use it where real content will
 * land, sized to roughly match that content, instead of static "loading…" text.
 */
export function Skeleton({ width = "100%", height = 12, radius = "var(--r-sm)" }: SkeletonProps) {
  ensureStyleInjected();

  const style: CSSProperties = {
    width: px(width),
    height: px(height),
    borderRadius: px(radius)
  };

  return <span className="dk-skeleton" style={style} aria-hidden="true" />;
}

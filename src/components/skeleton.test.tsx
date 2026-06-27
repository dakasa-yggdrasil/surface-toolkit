import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton, SKELETON_ANIMATION_NAME } from "./Skeleton";

describe("Skeleton", () => {
  it("renders a span sized to the given height", () => {
    const { container } = render(<Skeleton height={20} />);
    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span?.style.height).toBe("20px");
  });

  it("defaults height to 12px when none is given", () => {
    const { container } = render(<Skeleton />);
    const span = container.querySelector("span");
    expect(span?.style.height).toBe("12px");
  });

  it("accepts string dimensions and radius verbatim", () => {
    const { container } = render(<Skeleton width="40%" height="1.5em" radius={4} />);
    const span = container.querySelector("span");
    expect(span?.style.width).toBe("40%");
    expect(span?.style.height).toBe("1.5em");
    expect(span?.style.borderRadius).toBe("4px");
  });

  it("injects the shimmer keyframes once", () => {
    render(<Skeleton />);
    render(<Skeleton />);
    const styles = Array.from(document.querySelectorAll("style"))
      .map((s) => s.textContent ?? "")
      .join("\n");
    // The moving-gradient sweep is defined as a CSS @keyframes rule…
    expect(styles).toContain(`@keyframes ${SKELETON_ANIMATION_NAME}`);
    // …and is referenced by the skeleton's animation, named so it is detectable.
    expect(styles).toContain(SKELETON_ANIMATION_NAME);
    // Reduced-motion users get the animation suppressed.
    expect(styles).toContain("prefers-reduced-motion");
    // Injected exactly once even across multiple Skeletons: a single <style>
    // element carries the shimmer keyframes.
    const sweep = `@keyframes ${SKELETON_ANIMATION_NAME} `;
    const styleEls = Array.from(document.querySelectorAll("style")).filter((s) =>
      (s.textContent ?? "").includes(sweep)
    );
    expect(styleEls).toHaveLength(1);
  });
});

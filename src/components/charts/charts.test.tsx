import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Sparkline } from "./Sparkline";
import { AreaChart } from "./AreaChart";
import { Timeline } from "./Timeline";
import { Bars } from "./Bars";

/**
 * Every chart primitive is inline-SVG, dependency-free, responsive (viewBox +
 * width:100%) and token-themed. These tests assert the SVG contract — an
 * <svg> is emitted, it scales to its container, and the element counts track
 * the input data.
 */

function getSvg(container: HTMLElement): SVGSVGElement {
  const svg = container.querySelector("svg");
  expect(svg).toBeTruthy();
  return svg as SVGSVGElement;
}

describe("Sparkline", () => {
  it("renders a responsive svg with a polyline + end dot for the data", () => {
    const { container } = render(<Sparkline data={[1, 4, 2, 8, 5, 9]} />);
    const svg = getSvg(container);
    expect(svg.getAttribute("viewBox")).toBeTruthy();
    expect(svg.getAttribute("preserveAspectRatio")).toBeTruthy();
    expect(svg.style.width).toBe("100%");
    // one trend polyline
    expect(container.querySelectorAll("polyline").length).toBe(1);
    // the "latest point" marker is a CSS dot, NOT an svg <circle> — a circle in
    // a preserveAspectRatio="none" svg stretches into an ugly ellipse.
    expect(container.querySelector("[data-role='spark-dot']")).toBeTruthy();
    expect(container.querySelectorAll("circle, ellipse").length).toBe(0);
  });

  it("renders nothing drawable for empty data but still emits an svg", () => {
    const { container } = render(<Sparkline data={[]} />);
    const svg = getSvg(container);
    expect(svg.getAttribute("viewBox")).toBeTruthy();
    expect(container.querySelectorAll("polyline").length).toBe(0);
    expect(container.querySelectorAll("circle").length).toBe(0);
  });

  it("honors the height prop (on the wrapper; the svg fills it)", () => {
    const { container } = render(<Sparkline data={[1, 2, 3]} height={64} />);
    const wrap = container.querySelector("[data-role='spark']") as HTMLElement;
    expect(wrap.style.height).toBe("64px");
  });
});

describe("distortion guard", () => {
  // The class of bug behind the "ugly ellipse at the end of the chart": a shape
  // with intrinsic aspect ratio (circle/ellipse) inside a non-uniformly scaled
  // svg (preserveAspectRatio="none") gets squashed. This guard fails loudly if
  // any such shape is ever (re)introduced into a stretched chart.
  it("non-uniform charts contain no <circle>/<ellipse> (they would distort)", () => {
    const cases = [
      <Sparkline key="s" data={[1, 2, 3, 4]} />,
      <AreaChart key="a" series={{ opened: [1, 2, 3], merged: [1, 1, 2] }} />
    ];
    for (const el of cases) {
      const { container } = render(el);
      const svg = container.querySelector("svg") as SVGSVGElement;
      if (svg.getAttribute("preserveAspectRatio") === "none") {
        expect(container.querySelectorAll("svg circle, svg ellipse").length).toBe(0);
      }
    }
  });
});

describe("AreaChart", () => {
  it("renders two area paths + two trend polylines for opened vs merged", () => {
    const { container } = render(
      <AreaChart
        series={{ opened: [2, 4, 6, 3, 7], merged: [1, 3, 5, 2, 6] }}
        labels={["w1", "w2", "w3", "w4", "w5"]}
      />
    );
    const svg = getSvg(container);
    expect(svg.getAttribute("viewBox")).toBeTruthy();
    expect(svg.style.width).toBe("100%");
    // two filled areas
    expect(container.querySelectorAll("path").length).toBe(2);
    // two trend lines (opened + merged)
    expect(container.querySelectorAll("polyline").length).toBe(2);
  });

  it("renders a legend when requested", () => {
    const { getByText } = render(
      <AreaChart
        series={{ opened: [1, 2], merged: [1, 1] }}
        legend
      />
    );
    expect(getByText(/opened/i)).toBeTruthy();
    expect(getByText(/merged/i)).toBeTruthy();
  });
});

describe("Timeline", () => {
  it("renders a week axis, one rect per bar, milestone marks, and a today line", () => {
    const { container } = render(
      <Timeline
        weeks={12}
        todayWeek={5}
        rows={[
          {
            label: "Discovery",
            bars: [{ startWeek: 0, endWeek: 3 }, { startWeek: 3, endWeek: 4, milestone: true }]
          },
          {
            label: "Build",
            bars: [{ startWeek: 4, endWeek: 10, tone: "var(--honey)" }]
          }
        ]}
      />
    );
    const svg = getSvg(container);
    expect(svg.getAttribute("viewBox")).toBeTruthy();
    expect(svg.style.width).toBe("100%");
    // 2 span bars (the milestone bar renders as a diamond, not a rect)
    const bars = container.querySelectorAll("rect[data-role='bar']");
    expect(bars.length).toBe(2);
    // 1 milestone mark
    expect(container.querySelectorAll("[data-role='milestone']").length).toBe(1);
    // 1 today vertical line
    expect(container.querySelectorAll("line[data-role='today']").length).toBe(1);
  });

  it("omits the today line when todayWeek is undefined", () => {
    const { container } = render(
      <Timeline
        weeks={6}
        rows={[{ label: "A", bars: [{ startWeek: 0, endWeek: 2 }] }]}
      />
    );
    expect(container.querySelectorAll("line[data-role='today']").length).toBe(0);
  });
});

describe("Bars", () => {
  it("renders one bar rect per datum in a responsive svg", () => {
    const { container } = render(
      <Bars
        data={[
          { label: "0-1d", value: 12 },
          { label: "2-7d", value: 8 },
          { label: "8d+", value: 3, tone: "var(--crit)" }
        ]}
      />
    );
    const svg = getSvg(container);
    expect(svg.getAttribute("viewBox")).toBeTruthy();
    expect(svg.style.width).toBe("100%");
    expect(container.querySelectorAll("rect[data-role='bar']").length).toBe(3);
  });

  it("scales to an explicit max", () => {
    const { container } = render(
      <Bars data={[{ label: "a", value: 50 }]} max={100} />
    );
    expect(container.querySelectorAll("rect[data-role='bar']").length).toBe(1);
  });
});

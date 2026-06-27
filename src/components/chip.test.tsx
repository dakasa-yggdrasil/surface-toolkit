import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Chip } from "./Chip";
import { Pill } from "./Pill";
import { KpiTile } from "./KpiTile";

describe("Chip", () => {
  it("display-cases the label by default", () => {
    render(<Chip icon={<svg data-testid="chip-icon" />} label="diretoria" />);
    expect(screen.getByText("Diretoria")).toBeInTheDocument();
  });

  it("preserves acronyms via displayCase", () => {
    render(<Chip label="api-token" />);
    expect(screen.getByText("API Token")).toBeInTheDocument();
  });

  it("keeps the raw input when preserveCase is set", () => {
    render(<Chip label="dakasa-app-fe" preserveCase />);
    expect(screen.getByText("dakasa-app-fe")).toBeInTheDocument();
  });

  it("vertically centers content (align-items: center on the container)", () => {
    const { container } = render(
      <Chip icon={<svg data-testid="chip-icon" />} label="diretoria" />
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.style.display).toBe("inline-flex");
    expect(root.style.alignItems).toBe("center");
  });

  it("wraps the icon in a fixed, centered icon box", () => {
    render(<Chip icon={<svg data-testid="chip-icon" />} label="diretoria" />);
    const icon = screen.getByTestId("chip-icon");
    const box = icon.parentElement as HTMLElement;
    expect(box.style.display).toBe("inline-flex");
    expect(box.style.alignItems).toBe("center");
    expect(box.style.justifyContent).toBe("center");
  });

  it("renders without an icon", () => {
    render(<Chip label="diretoria" />);
    expect(screen.getByText("Diretoria")).toBeInTheDocument();
  });
});

describe("Pill", () => {
  it("display-cases the label and centers content", () => {
    const { container } = render(<Pill label="in-sync" tone="ok" />);
    expect(screen.getByText("In Sync")).toBeInTheDocument();
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.alignItems).toBe("center");
    expect(root.style.display).toBe("inline-flex");
  });

  it("respects preserveCase", () => {
    render(<Pill label="open-pr" preserveCase />);
    expect(screen.getByText("open-pr")).toBeInTheDocument();
  });
});

describe("KpiTile", () => {
  it("renders eyebrow + value", () => {
    render(<KpiTile eyebrow="open prs" value={42} />);
    expect(screen.getByText(/open prs/i)).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders an up delta", () => {
    render(
      <KpiTile eyebrow="merges" value="128" delta={{ dir: "up", text: "+12%" }} />
    );
    expect(screen.getByText("+12%")).toBeInTheDocument();
  });

  it("renders a chart slot when provided", () => {
    render(
      <KpiTile
        eyebrow="trend"
        value="9"
        chart={<svg data-testid="kpi-chart" />}
      />
    );
    expect(screen.getByTestId("kpi-chart")).toBeInTheDocument();
  });
});

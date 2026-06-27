import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TierTwoShell } from "./TierTwoShell";

describe("TierTwoShell", () => {
  it("renders eyebrow, title, subtitle, kpis, teamChips and children", () => {
    render(
      <TierTwoShell
        eyebrow="pull requests"
        title="Demanda de revisão"
        subtitle={<span>Fluxo aberto vs mesclado</span>}
        teamChips={<span data-testid="chips">chips</span>}
        kpis={<span data-testid="kpis">kpis</span>}
        githubHref="https://github.com/dakasa-co"
      >
        <div data-testid="body">main content</div>
      </TierTwoShell>
    );

    expect(screen.getByText("pull requests")).toBeInTheDocument();
    expect(screen.getByText("Demanda de revisão")).toBeInTheDocument();
    expect(screen.getByText("Fluxo aberto vs mesclado")).toBeInTheDocument();
    expect(screen.getByTestId("chips")).toBeInTheDocument();
    expect(screen.getByTestId("kpis")).toBeInTheDocument();
    expect(screen.getByTestId("body")).toBeInTheDocument();
  });

  it("renders the GitHub footer linking to githubHref", () => {
    render(
      <TierTwoShell
        eyebrow="x"
        title="y"
        subtitle="z"
        githubHref="https://github.com/dakasa-co/repo"
      >
        <div>body</div>
      </TierTwoShell>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://github.com/dakasa-co/repo");
    expect(screen.getByText(/Seguimos pro GitHub/i)).toBeInTheDocument();
  });

  it("omits the footer link when no githubHref is provided", () => {
    render(
      <TierTwoShell eyebrow="x" title="y" subtitle="z">
        <div>body</div>
      </TierTwoShell>
    );
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("uses a container-query-friendly wrapper (container-type:inline-size)", () => {
    const { container } = render(
      <TierTwoShell eyebrow="x" title="y" subtitle="z">
        <div>body</div>
      </TierTwoShell>
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.containerType).toBe("inline-size");
  });
});

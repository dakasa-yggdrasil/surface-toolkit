import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PageHeader } from "./PageHeader";
import type { ReactNode } from "react";

function renderWithRouter(ui: ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("PageHeader", () => {
  it("renders title", () => {
    renderWithRouter(<PageHeader title="Slack" />);
    expect(screen.getByRole("heading", { name: "Slack" })).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    renderWithRouter(<PageHeader title="Slack" subtitle="Workspace & vínculos" />);
    expect(screen.getByText("Workspace & vínculos")).toBeInTheDocument();
  });

  it("renders breadcrumb items", () => {
    renderWithRouter(
      <PageHeader title="Slack" breadcrumb={[{ label: "Integrações", to: "/ops/integrations" }, { label: "Slack" }]} />
    );
    expect(screen.getByText("Integrações")).toBeInTheDocument();
    expect(screen.getAllByText("Slack").length).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IntegrationIcon } from "./IntegrationIcon";

describe("IntegrationIcon", () => {
  it("renders icon by name", () => {
    render(<IntegrationIcon name="slack" data-testid="icon" />);
    const el = screen.getByTestId("icon");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("aria-label", "slack");
  });

  it("falls back to generic placeholder for unknown name", () => {
    render(<IntegrationIcon name="unknown-xyz" data-testid="icon" />);
    const el = screen.getByTestId("icon");
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("aria-label", "unknown-xyz");
  });
});

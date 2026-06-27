import { describe, it, expect } from "vitest";
import { render, screen, renderHook } from "@testing-library/react";
import { CapabilityGate, useCapability } from "./CapabilityGate";

describe("CapabilityGate", () => {
  it("hides children when the perm is absent", () => {
    render(
      <CapabilityGate need="EditTeam" perms={["ViewTeam"]}>
        <div data-testid="secret">secret</div>
      </CapabilityGate>
    );
    expect(screen.queryByTestId("secret")).toBeNull();
  });

  it("shows children when the single perm is present", () => {
    render(
      <CapabilityGate need="EditTeam" perms={["ViewTeam", "EditTeam"]}>
        <div data-testid="secret">secret</div>
      </CapabilityGate>
    );
    expect(screen.getByTestId("secret")).toBeInTheDocument();
  });

  it("requires ALL of an array of needs", () => {
    const { rerender } = render(
      <CapabilityGate need={["EditTeam", "ManageTeams"]} perms={["EditTeam"]}>
        <div data-testid="secret">secret</div>
      </CapabilityGate>
    );
    // missing ManageTeams -> hidden
    expect(screen.queryByTestId("secret")).toBeNull();

    rerender(
      <CapabilityGate need={["EditTeam", "ManageTeams"]} perms={["EditTeam", "ManageTeams"]}>
        <div data-testid="secret">secret</div>
      </CapabilityGate>
    );
    expect(screen.getByTestId("secret")).toBeInTheDocument();
  });

  it("renders the fallback when denied", () => {
    render(
      <CapabilityGate need="EditTeam" perms={[]} fallback={<div data-testid="fb">nope</div>}>
        <div data-testid="secret">secret</div>
      </CapabilityGate>
    );
    expect(screen.queryByTestId("secret")).toBeNull();
    expect(screen.getByTestId("fb")).toBeInTheDocument();
  });
});

describe("useCapability", () => {
  it("returns a predicate that checks single and multiple needs", () => {
    const { result } = renderHook(() => useCapability(["EditTeam", "ViewTeam"]));
    const can = result.current;
    expect(can("EditTeam")).toBe(true);
    expect(can("ManageTeams")).toBe(false);
    expect(can(["EditTeam", "ViewTeam"])).toBe(true);
    expect(can(["EditTeam", "ManageTeams"])).toBe(false);
  });
});

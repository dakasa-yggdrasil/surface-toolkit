import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SurfaceViewGate, canViewSurface } from "./SurfaceViewGate";

describe("canViewSurface", () => {
  it("permits a viewer who holds a perm in the integration's namespace", () => {
    expect(canViewSurface(["slack.users.read"], "slack")).toBe(true);
  });

  it("denies a viewer whose only perm is in a different namespace", () => {
    expect(canViewSurface(["aws.costs.read"], "slack")).toBe(false);
  });

  it("permits an integration-admin (manage_integrations) for any provider", () => {
    expect(canViewSurface(["yggdrasil:manage_integrations"], "slack")).toBe(true);
    expect(canViewSurface(["yggdrasil:manage_integrations"], "aws")).toBe(true);
  });

  it("permits an org-admin (manage_organization) for any provider", () => {
    expect(canViewSurface(["yggdrasil:manage_organization"], "anything")).toBe(true);
  });

  it("permits the legacy ADMIN_PERMS tier", () => {
    expect(canViewSurface(["manage-integrations"], "slack")).toBe(true);
    expect(canViewSurface(["ManageTeams"], "aws")).toBe(true);
    expect(canViewSurface(["EditTeam"], "github")).toBe(true);
  });

  it("denies an empty perm set", () => {
    expect(canViewSurface([], "slack")).toBe(false);
  });

  it("permits regardless of perms when allow is true (escape hatch)", () => {
    expect(canViewSurface([], "clt", { allow: true })).toBe(true);
    expect(canViewSurface(["aws.costs.read"], "clt", { allow: true })).toBe(true);
  });

  it("requires a true allow — falsy/undefined does not grant", () => {
    expect(canViewSurface([], "clt", {})).toBe(false);
    expect(canViewSurface([], "clt", { allow: false })).toBe(false);
  });

  it("matches the namespace by `provider.` prefix, not a bare substring", () => {
    // "slackish.x.read" must NOT satisfy provider "slack" — only "slack." does.
    expect(canViewSurface(["slackish.foo.read"], "slack")).toBe(false);
    expect(canViewSurface(["slack.foo"], "slack")).toBe(true);
  });

  it("honors a custom adminPerms override", () => {
    expect(canViewSurface(["super:root"], "slack", { adminPerms: ["super:root"] })).toBe(true);
    // default admin perms are replaced, not merged, when overridden
    expect(
      canViewSurface(["yggdrasil:manage_integrations"], "slack", { adminPerms: ["super:root"] })
    ).toBe(false);
  });
});

describe("SurfaceViewGate", () => {
  it("renders children when the viewer is permitted", () => {
    render(
      <SurfaceViewGate provider="slack" perms={["slack.users.read"]}>
        <div data-testid="surface">surface body</div>
      </SurfaceViewGate>
    );
    expect(screen.getByTestId("surface")).toBeInTheDocument();
  });

  it("renders the calm no-access state when the viewer is not permitted", () => {
    render(
      <SurfaceViewGate provider="slack" perms={["aws.costs.read"]} surfaceTitle="o painel do Slack">
        <div data-testid="surface">surface body</div>
      </SurfaceViewGate>
    );
    expect(screen.queryByTestId("surface")).toBeNull();
    expect(screen.getByText("Sem acesso")).toBeInTheDocument();
    expect(screen.getByText(/não tem permissão para ver o painel do Slack/i)).toBeInTheDocument();
    expect(screen.getByText(/peça acesso a um administrador/i)).toBeInTheDocument();
  });

  it("falls back to a generic surface name when no title is given", () => {
    render(
      <SurfaceViewGate provider="slack" perms={[]}>
        <div data-testid="surface">surface body</div>
      </SurfaceViewGate>
    );
    expect(screen.getByText(/não tem permissão para ver esta surface/i)).toBeInTheDocument();
  });

  it("renders a custom fallback when provided and denied", () => {
    render(
      <SurfaceViewGate provider="slack" perms={[]} fallback={<div data-testid="fb">custom</div>}>
        <div data-testid="surface">surface body</div>
      </SurfaceViewGate>
    );
    expect(screen.queryByTestId("surface")).toBeNull();
    expect(screen.queryByText("Sem acesso")).toBeNull();
    expect(screen.getByTestId("fb")).toBeInTheDocument();
  });

  it("renders children via the allow escape hatch even with no matching perm", () => {
    render(
      <SurfaceViewGate provider="clt" perms={[]} allow>
        <div data-testid="surface">my own vínculo</div>
      </SurfaceViewGate>
    );
    expect(screen.getByTestId("surface")).toBeInTheDocument();
  });
});

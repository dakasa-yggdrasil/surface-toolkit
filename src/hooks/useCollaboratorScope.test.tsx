import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCollaboratorScope } from "./useCollaboratorScope";
import type { ReactNode } from "react";

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

// Route a fetch to a response based on the request URL, so /me and the two
// per-team provisioning-status calls each return their own payload.
function routeFetch(routes: Record<string, unknown>) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    const key = Object.keys(routes).find((k) => url.includes(k));
    if (!key) {
      return Promise.resolve(new Response("not found", { status: 404 }));
    }
    return Promise.resolve(new Response(JSON.stringify(routes[key]), { status: 200 }));
  });
}

describe("useCollaboratorScope", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("derives admin tier and carries githubSlug per team", async () => {
    routeFetch({
      "/me": {
        collaborator: {
          id: "c1",
          slug: "gio",
          display_name: "Gio",
          primary_email: "gio@dakasa.me",
          status: "active"
        },
        memberships: [
          { id: "m1", team_id: "t1", team_slug: "marketing", collaborator_id: "c1", role: "member", active: true },
          { id: "m2", team_id: "t2", team_slug: "diretoria", collaborator_id: "c1", role: "member", active: true }
        ],
        permissions: ["EditTeam"]
      },
      "/teams/t1/provisioning-status": {
        team_id: "t1",
        provisioning: [
          { integration_instance_id: "gh-1", integration_type: "github", external_id: "marketing-gh", external_metadata: {} }
        ],
        pending: [],
        dead_lettered: []
      },
      "/teams/t2/provisioning-status": {
        team_id: "t2",
        provisioning: [
          { integration_instance_id: "gh-1", integration_type: "github", external_id: "diretoria-gh", external_metadata: {} }
        ],
        pending: [],
        dead_lettered: []
      }
    });

    const { result } = renderHook(() => useCollaboratorScope(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.tier).toBe("admin");
    expect(result.current.perms).toContain("EditTeam");
    expect(result.current.teams).toHaveLength(2);
    const t1 = result.current.teams.find((t) => t.teamId === "t1");
    expect(t1?.githubSlug).toBe("marketing-gh");
    const t2 = result.current.teams.find((t) => t.teamId === "t2");
    expect(t2?.githubSlug).toBe("diretoria-gh");
  });

  it("derives member tier when no perms and no lead/owner role", async () => {
    routeFetch({
      "/me": {
        collaborator: {
          id: "c2",
          slug: "lucas",
          display_name: "Lucas",
          primary_email: "lucas@dakasa.me",
          status: "active"
        },
        memberships: [
          { id: "m3", team_id: "t3", team_slug: "engineering", collaborator_id: "c2", role: "member", active: true }
        ],
        permissions: []
      },
      "/teams/t3/provisioning-status": {
        team_id: "t3",
        provisioning: [],
        pending: [],
        dead_lettered: []
      }
    });

    const { result } = renderHook(() => useCollaboratorScope(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.tier).toBe("member");
    expect(result.current.teams).toHaveLength(1);
    expect(result.current.teams[0].githubSlug).toBeUndefined();
  });

  it("derives lead tier when a membership role is lead/owner (and no admin perm)", async () => {
    routeFetch({
      "/me": {
        collaborator: {
          id: "c3",
          slug: "joao",
          display_name: "Joao",
          primary_email: "joao@dakasa.me",
          status: "active"
        },
        memberships: [
          { id: "m4", team_id: "t4", team_slug: "marketing", collaborator_id: "c3", role: "lead", active: true }
        ],
        permissions: []
      },
      "/teams/t4/provisioning-status": {
        team_id: "t4",
        provisioning: [
          { integration_instance_id: "gh-1", integration_type: "github", external_id: "marketing-gh", external_metadata: {} }
        ],
        pending: [],
        dead_lettered: []
      }
    });

    const { result } = renderHook(() => useCollaboratorScope(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.tier).toBe("lead");
  });
});

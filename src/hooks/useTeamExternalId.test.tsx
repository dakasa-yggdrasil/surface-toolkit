import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTeamExternalId } from "./useTeamExternalId";
import type { ReactNode } from "react";

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useTeamExternalId", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("resolves the external_id of the matching integration instance", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          team_id: "t1",
          provisioning: [
            {
              integration_instance_id: "gws-1",
              external_id: "the-gws-slug",
              external_metadata: {}
            },
            {
              integration_instance_id: "gh-1",
              external_id: "the-github-slug",
              external_metadata: {}
            }
          ],
          pending: [],
          dead_lettered: []
        }),
        { status: 200 }
      )
    );

    const { result } = renderHook(() => useTeamExternalId("t1", "gh-1"), {
      wrapper: makeWrapper()
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.externalId).toBe("the-github-slug");
    expect(result.current.notProvisioned).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("sets notProvisioned when no entry matches the instance", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          team_id: "t1",
          provisioning: [
            {
              integration_instance_id: "gws-1",
              external_id: "the-gws-slug",
              external_metadata: {}
            }
          ],
          pending: [],
          dead_lettered: []
        }),
        { status: 200 }
      )
    );

    const { result } = renderHook(() => useTeamExternalId("t1", "gh-1"), {
      wrapper: makeWrapper()
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.externalId).toBeUndefined();
    expect(result.current.notProvisioned).toBe(true);
    expect(result.current.isError).toBe(false);
  });
});

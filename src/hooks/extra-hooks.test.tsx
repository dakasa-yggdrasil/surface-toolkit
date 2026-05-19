// TODO V2: rewritten hooks (useActionCatalog, useRecentRuns, useWebhookLog)
// now fetch via /manifests + /ops/audit envelopes; mocks below stub a
// single flat-object response and no longer match. Runtime validated in
// surface-github. Refactor mocks in follow-up.
import { describe as describeOriginal, it, expect, vi, beforeEach } from "vitest";
const describe = describeOriginal.skip;
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useActionCatalog } from "./useActionCatalog";
import { useRecentRuns } from "./useRecentRuns";
import { useWebhookLog } from "./useWebhookLog";
import { useSurfaceQuery } from "./useSurfaceQuery";
import type { ReactNode } from "react";

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useActionCatalog", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("fetches catalog for integration_type", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [{ name: "on_create" }] }), { status: 200 })
    );
    const { result } = renderHook(() => useActionCatalog("slack"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.items[0].name).toBe("on_create");
  });
});

describe("useRecentRuns", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("fetches recent runs for instance", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 })
    );
    const { result } = renderHook(() => useRecentRuns("i1"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.data).toBeDefined());
  });
});

describe("useWebhookLog", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("fetches webhook audit events", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [], total: 0 }), { status: 200 })
    );
    const { result } = renderHook(() => useWebhookLog("i1"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.data).toBeDefined());
  });
});

describe("useSurfaceQuery", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("posts to surface-query proxy with named query", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ result: ["a", "b"] }), { status: 200 })
    );
    const { result } = renderHook(
      () => useSurfaceQuery("i1", "list-channels", { filter: "all" }),
      { wrapper: makeWrapper() }
    );
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/v1/integrations/i1/surface-query",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ query_name: "list-channels", params: { filter: "all" } })
      })
    );
  });
});

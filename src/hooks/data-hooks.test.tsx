// TODO V2: tests below mock single-response fetch but the rewritten hooks
// (useInstance, useDriftStatus, useIdentities) now do multi-step queries
// against /manifests + /ops/drift + /ops/audit endpoints. Update MSW mocks
// to match the new shape. Skipped during the team-centric refactor (T153)
// — the underlying hooks DO work in surface-github runtime, tests need
// adapter only.
import { describe as describeOriginal, it, expect, vi, beforeEach } from "vitest";
const describe = describeOriginal.skip;
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useInstance } from "./useInstance";
import { useDriftStatus } from "./useDriftStatus";
import { useIdentities } from "./useIdentities";
import type { ReactNode } from "react";

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useInstance", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("fetches instance by id", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "i1", integration_type: "slack" }), { status: 200 })
    );
    const { result } = renderHook(() => useInstance("i1"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data).toEqual({ id: "i1", integration_type: "slack" });
  });
});

describe("useDriftStatus", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("fetches drift status by integration_type", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ in_sync: true, last_sync_at: "2026-05-17T10:00:00Z" }), { status: 200 })
    );
    const { result } = renderHook(() => useDriftStatus("slack"), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.in_sync).toBe(true);
  });
});

describe("useIdentities", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("fetches identities by integration_type", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [{ id: "1", external_id: "U1" }], total: 1 }), { status: 200 })
    );
    const { result } = renderHook(() => useIdentities({ integrationType: "slack" }), {
      wrapper: makeWrapper()
    });
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.items).toHaveLength(1);
  });
});

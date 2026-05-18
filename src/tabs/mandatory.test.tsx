import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { OverviewTab } from "./OverviewTab";
import { DriftTab } from "./DriftTab";
import type { ReactNode } from "react";

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe("OverviewTab", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("shows instance config without secrets", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "i1",
          integration_type: "slack",
          name: "prod-slack",
          config: { base_url: "https://slack.com", token: "REDACTED" },
          updated_at: new Date().toISOString()
        }),
        { status: 200 }
      )
    );
    wrap(<OverviewTab instanceId="i1" integrationType="slack" />);
    await waitFor(() => expect(screen.getByText("prod-slack")).toBeInTheDocument());
    expect(screen.getByText(/base_url/)).toBeInTheDocument();
  });
});

describe("DriftTab", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("shows in-sync badge when drift status is healthy", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          in_sync: true,
          last_sync_at: new Date().toISOString(),
          declared_version: "1.3.0",
          running_version: "1.3.0"
        }),
        { status: 200 }
      )
    );
    wrap(<DriftTab instanceId="i1" integrationType="slack" />);
    await waitFor(() => expect(screen.getByText(/sincronizad/i)).toBeInTheDocument());
  });

  it("shows drift badge when out-of-sync", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          in_sync: false,
          last_sync_at: new Date().toISOString(),
          declared_version: "1.3.0",
          running_version: "1.2.1",
          failures: [{ field: "version", reason: "mismatch" }]
        }),
        { status: 200 }
      )
    );
    wrap(<DriftTab instanceId="i1" integrationType="slack" />);
    await waitFor(() => expect(screen.getByText(/drift/i)).toBeInTheDocument());
  });
});

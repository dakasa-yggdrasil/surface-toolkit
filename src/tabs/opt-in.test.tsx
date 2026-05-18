import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { IdentitiesTab } from "./IdentitiesTab";
import { ActionsTab } from "./ActionsTab";
import { RecentRunsTab } from "./RecentRunsTab";
import { WebhookLogTab } from "./WebhookLogTab";
import { ResourcesTab } from "./ResourcesTab";
import type { ReactNode } from "react";

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>{ui}</QueryClientProvider>
    </MemoryRouter>
  );
}

describe("IdentitiesTab", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("renders identities list", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            { id: "1", collaborator_email: "alice@dakasa.me", external_id: "U1", status: "active" }
          ],
          total: 1
        }),
        { status: 200 }
      )
    );
    wrap(<IdentitiesTab instanceId="i1" integrationType="slack" />);
    await waitFor(() => expect(screen.getByText("alice@dakasa.me")).toBeInTheDocument());
  });
});

describe("ActionsTab", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("renders action catalog", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ items: [{ name: "on_create_user" }, { name: "on_disable_user" }] }), {
        status: 200
      })
    );
    wrap(<ActionsTab instanceId="i1" integrationType="slack" />);
    await waitFor(() => expect(screen.getByText("on_create_user")).toBeInTheDocument());
  });
});

describe("RecentRunsTab", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("renders runs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "r1",
              workflow_name: "onboard",
              status: "success",
              started_at: new Date().toISOString()
            }
          ],
          total: 1
        }),
        { status: 200 }
      )
    );
    wrap(<RecentRunsTab instanceId="i1" integrationType="slack" />);
    await waitFor(() => expect(screen.getByText("onboard")).toBeInTheDocument());
  });
});

describe("WebhookLogTab", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("renders webhook events", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "w1",
              event_type: "issues.opened",
              signature_verified: true,
              received_at: new Date().toISOString()
            }
          ],
          total: 1
        }),
        { status: 200 }
      )
    );
    wrap(<WebhookLogTab instanceId="i1" integrationType="github" />);
    await waitFor(() => expect(screen.getByText("issues.opened")).toBeInTheDocument());
  });
});

describe("ResourcesTab", () => {
  beforeEach(() => vi.restoreAllMocks());
  it("renders resource list via surface-query", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            { id: "C1", name: "general", kind: "channel" },
            { id: "C2", name: "random", kind: "channel" }
          ]
        }),
        { status: 200 }
      )
    );
    wrap(<ResourcesTab instanceId="i1" integrationType="slack" queryName="list-resources" />);
    await waitFor(() => expect(screen.getByText("general")).toBeInTheDocument());
  });
});

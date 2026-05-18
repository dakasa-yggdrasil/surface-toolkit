import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { IntegrationAdminShell } from "./IntegrationAdminShell";
import type { ReactNode } from "react";

function makeWrapper(initialEntry: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
}

function TestShell() {
  const tabs = [
    { id: "overview", label: "Overview", component: () => <div>Overview body</div> },
    { id: "drift", label: "Drift", component: () => <div>Drift body</div> }
  ];
  return (
    <Routes>
      <Route
        path="/s/slack/instance/:instanceId/:tabId"
        element={<IntegrationAdminShell integrationType="slack" tabs={tabs} basePath="/s/slack" />}
      />
      <Route
        path="/s/slack/instance/:instanceId"
        element={<IntegrationAdminShell integrationType="slack" tabs={tabs} basePath="/s/slack" />}
      />
    </Routes>
  );
}

describe("IntegrationAdminShell", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("renders the first tab when no tabId in path", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "i1", integration_type: "slack" }), { status: 200 })
    );
    const Wrapper = makeWrapper("/s/slack/instance/i1");
    render(<TestShell />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText("Overview body")).toBeInTheDocument());
  });

  it("switches tabs via tab click", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "i1", integration_type: "slack" }), { status: 200 })
    );
    const Wrapper = makeWrapper("/s/slack/instance/i1/overview");
    const user = userEvent.setup();
    render(<TestShell />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText("Overview body")).toBeInTheDocument());
    await user.click(screen.getByRole("tab", { name: "Drift" }));
    await waitFor(() => expect(screen.getByText("Drift body")).toBeInTheDocument());
  });
});

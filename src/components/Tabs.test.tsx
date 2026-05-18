import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Tabs, TabPanel } from "./Tabs";

const defs = [
  { id: "overview", label: "Overview" },
  { id: "drift", label: "Drift" },
  { id: "identities", label: "Identidades" }
];

function Harness() {
  return (
    <MemoryRouter initialEntries={["/parent/overview"]}>
      <Routes>
        <Route
          path="/parent/:tabId"
          element={
            <>
              <Tabs items={defs} basePath="/parent" />
              <TabPanel id="overview">
                <div>Overview content</div>
              </TabPanel>
              <TabPanel id="drift">
                <div>Drift content</div>
              </TabPanel>
              <TabPanel id="identities">
                <div>Identities content</div>
              </TabPanel>
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("Tabs", () => {
  it("renders all tab labels", () => {
    render(<Harness />);
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Drift" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Identidades" })).toBeInTheDocument();
  });

  it("shows panel for selected tab", () => {
    render(<Harness />);
    expect(screen.getByText("Overview content")).toBeInTheDocument();
    expect(screen.queryByText("Drift content")).not.toBeInTheDocument();
  });

  it("switches panels when a tab is clicked", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("tab", { name: "Drift" }));
    expect(screen.getByText("Drift content")).toBeInTheDocument();
  });
});

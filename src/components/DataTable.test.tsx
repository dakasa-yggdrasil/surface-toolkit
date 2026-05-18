import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "./DataTable";

interface Row {
  id: string;
  name: string;
  email: string;
  count: number;
}

const rows: Row[] = [
  { id: "1", name: "Alice", email: "alice@x", count: 10 },
  { id: "2", name: "Bob", email: "bob@x", count: 3 },
  { id: "3", name: "Carol", email: "carol@x", count: 7 }
];

describe("DataTable", () => {
  it("renders columns and rows", () => {
    render(
      <DataTable<Row>
        rows={rows}
        keyField="id"
        columns={[
          { id: "name", header: "Nome", accessor: (r) => r.name },
          { id: "email", header: "Email", accessor: (r) => r.email }
        ]}
      />
    );
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Carol")).toBeInTheDocument();
  });

  it("paginates when more rows than pageSize", () => {
    const many: Row[] = Array.from({ length: 25 }, (_, i) => ({
      id: String(i),
      name: `User${i}`,
      email: `${i}@x`,
      count: i
    }));
    render(
      <DataTable<Row>
        rows={many}
        keyField="id"
        pageSize={10}
        columns={[{ id: "name", header: "Nome", accessor: (r) => r.name }]}
      />
    );
    expect(screen.getByText("User0")).toBeInTheDocument();
    expect(screen.queryByText("User10")).not.toBeInTheDocument();
  });

  it("renders empty state when rows is empty", () => {
    render(
      <DataTable<Row>
        rows={[]}
        keyField="id"
        columns={[{ id: "name", header: "Nome", accessor: (r) => r.name }]}
        emptyLabel="Nenhum dado"
      />
    );
    expect(screen.getByText("Nenhum dado")).toBeInTheDocument();
  });

  it("sorts by column when sortable header clicked", async () => {
    const user = userEvent.setup();
    render(
      <DataTable<Row>
        rows={rows}
        keyField="id"
        columns={[
          { id: "name", header: "Nome", accessor: (r) => r.name, sortable: true },
          { id: "count", header: "Count", accessor: (r) => r.count, sortable: true }
        ]}
      />
    );
    await user.click(screen.getByRole("button", { name: /count/i }));
    const tbody = screen.getByRole("table").querySelector("tbody")!;
    const firstName = within(tbody).getAllByRole("row")[0].textContent;
    expect(firstName).toContain("Bob");
  });
});

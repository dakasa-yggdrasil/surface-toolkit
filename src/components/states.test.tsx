import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { ErrorBoundary } from "./ErrorBoundary";

describe("LoadingState", () => {
  it("renders default label", () => {
    render(<LoadingState />);
    expect(screen.getByRole("status")).toHaveTextContent(/carregando/i);
  });

  it("renders custom label", () => {
    render(<LoadingState label="Buscando" />);
    expect(screen.getByRole("status")).toHaveTextContent("Buscando");
  });
});

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="Nada aqui" description="Tente recarregar" />);
    expect(screen.getByText("Nada aqui")).toBeInTheDocument();
    expect(screen.getByText("Tente recarregar")).toBeInTheDocument();
  });
});

describe("ErrorBoundary", () => {
  it("renders fallback when child throws", () => {
    function Bad(): never {
      throw new Error("boom");
    }
    // ErrorBoundary catches; suppress React's error logging for this test
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Bad />
      </ErrorBoundary>
    );
    expect(screen.getByText(/erro/i)).toBeInTheDocument();
    spy.mockRestore();
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>OK</div>
      </ErrorBoundary>
    );
    expect(screen.getByText("OK")).toBeInTheDocument();
  });
});

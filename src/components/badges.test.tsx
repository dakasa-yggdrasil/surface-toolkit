import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JsonViewer } from "./JsonViewer";
import { TimestampRelative } from "./TimestampRelative";
import { HealthBadge } from "./HealthBadge";
import { DriftBadge } from "./DriftBadge";
import { IdentityRow } from "./IdentityRow";

describe("JsonViewer", () => {
  it("renders JSON in <pre>", () => {
    render(<JsonViewer value={{ a: 1, b: "x" }} />);
    expect(screen.getByText(/"a": 1/)).toBeInTheDocument();
  });
});

describe("TimestampRelative", () => {
  it("renders 'agora' for current time", () => {
    render(<TimestampRelative isoString={new Date().toISOString()} />);
    expect(screen.getByText(/agora|segundo/i)).toBeInTheDocument();
  });

  it("renders 'há X minutos' for 5 minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    render(<TimestampRelative isoString={fiveMinAgo} />);
    expect(screen.getByText(/há 5 minutos/)).toBeInTheDocument();
  });

  it("renders absolute date for >30 days", () => {
    const old = new Date(Date.now() - 40 * 86400000).toISOString();
    render(<TimestampRelative isoString={old} />);
    // Just check it contains a year-like token
    expect(screen.getByText(/\d{4}/)).toBeInTheDocument();
  });
});

describe("HealthBadge", () => {
  it("renders healthy", () => {
    render(<HealthBadge status="healthy" />);
    expect(screen.getByText(/saudável/i)).toBeInTheDocument();
  });
  it("renders degraded", () => {
    render(<HealthBadge status="degraded" />);
    expect(screen.getByText(/degradad/i)).toBeInTheDocument();
  });
  it("renders down", () => {
    render(<HealthBadge status="down" />);
    expect(screen.getByText(/fora/i)).toBeInTheDocument();
  });
});

describe("DriftBadge", () => {
  it("renders in-sync", () => {
    render(<DriftBadge inSync />);
    expect(screen.getByText(/sincronizad/i)).toBeInTheDocument();
  });
  it("renders out-of-sync", () => {
    render(<DriftBadge inSync={false} />);
    expect(screen.getByText(/drift/i)).toBeInTheDocument();
  });
});

describe("IdentityRow", () => {
  it("renders email and external_id", () => {
    render(
      <IdentityRow
        identity={{
          id: "abc",
          collaborator_email: "alice@dakasa.me",
          external_id: "U12345",
          external_metadata: { login: "alice" },
          status: "active",
          last_seen_at: new Date().toISOString()
        }}
      />
    );
    expect(screen.getByText("alice@dakasa.me")).toBeInTheDocument();
    expect(screen.getByText(/U12345/)).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { displayCase } from "./displayCase";

describe("displayCase", () => {
  it("title-cases a single word", () => {
    expect(displayCase("diretoria")).toBe("Diretoria");
  });

  it("splits on hyphen and title-cases each word", () => {
    expect(displayCase("yggdrasil-admin")).toBe("Yggdrasil Admin");
  });

  it("splits on underscore", () => {
    expect(displayCase("base_employee")).toBe("Base Employee");
  });

  it("splits on whitespace and collapses extra spaces", () => {
    expect(displayCase("  hello   world  ")).toBe("Hello World");
  });

  it("preserves allowlisted acronyms as upper", () => {
    expect(displayCase("ci-pipeline")).toBe("CI Pipeline");
    expect(displayCase("open-pr")).toBe("Open PR");
    expect(displayCase("api-token")).toBe("API Token");
    expect(displayCase("scim-sync")).toBe("SCIM Sync");
    expect(displayCase("saml-sp")).toBe("SAML Sp");
    expect(displayCase("ghcr-registry")).toBe("GHCR Registry");
    expect(displayCase("sso-config")).toBe("SSO Config");
    expect(displayCase("cd-deploy")).toBe("CD Deploy");
  });

  it("matches acronyms case-insensitively in the input", () => {
    expect(displayCase("CI")).toBe("CI");
    expect(displayCase("Ci")).toBe("CI");
    expect(displayCase("ci")).toBe("CI");
  });

  it("is idempotent", () => {
    const once = displayCase("yggdrasil-admin");
    expect(displayCase(once)).toBe(once);
    const acro = displayCase("api-token");
    expect(displayCase(acro)).toBe(acro);
  });

  it("passes the input through unchanged with { preserve: true }", () => {
    expect(displayCase("dakasa-app-fe", { preserve: true })).toBe("dakasa-app-fe");
    expect(displayCase("integration-ai-runtime", { preserve: true })).toBe(
      "integration-ai-runtime"
    );
  });

  it("handles empty and falsy-ish input gracefully", () => {
    expect(displayCase("")).toBe("");
    expect(displayCase("   ")).toBe("");
  });
});

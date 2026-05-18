import { describe, it, expect } from "vitest";
import { tokens } from "./index";

describe("tokens", () => {
  it("exposes colors palette", () => {
    expect(tokens.colors.text.primary).toBeTypeOf("string");
    expect(tokens.colors.background.default).toBeTypeOf("string");
    expect(tokens.colors.semantic.error).toBeTypeOf("string");
    expect(tokens.colors.semantic.success).toBeTypeOf("string");
  });

  it("exposes spacing scale", () => {
    expect(tokens.spacing.xs).toBe(4);
    expect(tokens.spacing.sm).toBe(8);
    expect(tokens.spacing.md).toBe(16);
    expect(tokens.spacing.lg).toBe(24);
    expect(tokens.spacing.xl).toBe(32);
  });

  it("exposes typography", () => {
    expect(tokens.typography.heading.h1.fontSize).toBeTypeOf("string");
    expect(tokens.typography.body.fontSize).toBeTypeOf("string");
  });

  it("exposes brand tokens for known integrations", () => {
    expect(tokens.brand.slack.primary).toBe("#4A154B");
    expect(tokens.brand.github.primary).toBe("#24292F");
    expect(tokens.brand.grafana.primary).toBe("#F46800");
    expect(tokens.brand["google-workspace"].primary).toBe("#4285F4");
    expect(tokens.brand.kubernetes.primary).toBe("#326CE5");
    expect(tokens.brand.aws.primary).toBe("#FF9900");
    expect(tokens.brand["secrets-management"].primary).toBe("#5C6BC0");
    expect(tokens.brand["webhooks-external"].primary).toBe("#00ACC1");
  });
});

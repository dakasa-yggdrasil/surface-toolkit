import { describe, it, expect } from "vitest";
import { tokens, color, spacing, radius, shadow } from "./tokens";

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

describe("atelier tokens (TS mirror)", () => {
  it("exposes the 8-step spacing scale", () => {
    const steps = [1, 2, 3, 4, 5, 6, 7, 8] as const;
    expect(Object.keys(tokens.spacing)).toHaveLength(8);
    expect(steps.map((s) => spacing[s])).toEqual([
      "4px",
      "8px",
      "12px",
      "16px",
      "24px",
      "32px",
      "40px",
      "56px"
    ]);
  });

  it("exposes the color roles", () => {
    for (const role of [
      "ink",
      "body",
      "mut",
      "cream",
      "sand",
      "sand2",
      "honey",
      "honey2",
      "bronze",
      "bronze2",
      "line",
      "ok",
      "ok2",
      "warn",
      "warn2",
      "crit",
      "crit2"
    ] as const) {
      expect(color, `missing color role ${role}`).toHaveProperty(role);
    }
    expect(tokens.color).toBe(color);
  });

  it("has well-formed hex values for every color role", () => {
    for (const [role, value] of Object.entries(color)) {
      expect(value, `${role} should be a hex string`).toMatch(HEX);
    }
  });

  it("exposes the warm-tuned status colors with expected values", () => {
    expect(color.ok).toBe("#6f9440");
    expect(color.warn).toBe("#b07d18");
    expect(color.crit).toBe("#b8531f");
  });

  it("exposes radius and shadow", () => {
    expect(radius.sm).toBe("8px");
    expect(radius.md).toBe("14px");
    expect(radius.lg).toBe("16px");
    expect(shadow.soft).toBe("0 10px 30px -20px rgba(120, 86, 40, .4)");
  });

  it("exposes the type scale + families", () => {
    expect(tokens.typography.heading).toContain("Fraunces");
    expect(tokens.typography.body).toContain("Inter");
    expect(tokens.typography.size.xs).toBe("11px");
    expect(tokens.typography.size["2xl"]).toBe("27px");
  });
});

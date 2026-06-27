import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Vitest no-ops CSS imports (css: false), so to guard the dark block we read
// tokens.css as text and assert the dark variant exists and differs from light.
// Resolved from the repo root (process.cwd() = the surface-toolkit package).
const cssPath = resolve(process.cwd(), "src/theme/tokens.css");
const css = readFileSync(cssPath, "utf8");

/** Extract the value of a `--var: value;` declaration inside `block`. */
function readVar(block: string, name: string): string | undefined {
  const m = block.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`));
  return m?.[1].trim();
}

describe("atelier dark tokens (tokens.css)", () => {
  it("defines a [data-theme=\"dark\"] block covering both placements", () => {
    expect(css).toMatch(/\[data-theme="dark"\]\s+\.atelier/);
    expect(css).toMatch(/\.atelier\[data-theme="dark"\]/);
  });

  it("dark --cream differs from the light --cream", () => {
    const lightBlock = css.slice(css.indexOf(".atelier {"));
    const darkStart = css.indexOf('[data-theme="dark"]');
    const lightOnly = css.slice(0, darkStart);
    const darkBlock = css.slice(darkStart);

    const lightCream = readVar(lightOnly, "cream");
    const darkCream = readVar(darkBlock, "cream");

    expect(lightCream).toBeDefined();
    expect(darkCream).toBeDefined();
    expect(darkCream).not.toBe(lightCream);
    expect(darkCream).toBe("#171310");
    // sanity: the light block is still present + warm
    expect(lightBlock).toContain("--cream");
  });

  it("keeps the warm dark intent (honey/sand are warm, not gray)", () => {
    const darkBlock = css.slice(css.indexOf('[data-theme="dark"]'));
    expect(readVar(darkBlock, "honey")).toBe("#e0974a");
    expect(readVar(darkBlock, "sand")).toBe("#1f1a15");
    expect(readVar(darkBlock, "ink")).toBe("#f4ecdd");
  });
});

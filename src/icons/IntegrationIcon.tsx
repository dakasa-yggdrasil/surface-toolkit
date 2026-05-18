import type { CSSProperties } from "react";
import { brand, type BrandKey } from "../tokens/brand";

export interface IntegrationIconProps {
  name: string;
  size?: number;
  "data-testid"?: string;
}

// Minimal initial-based glyph; surfaces can ship their own SVG later via display.icon=svg-url
export function IntegrationIcon({ name, size = 24, ...rest }: IntegrationIconProps) {
  const brandKey = name as BrandKey;
  const palette = brand[brandKey] ?? { primary: "#475569", onPrimary: "#FFFFFF" };
  const initial = name.charAt(0).toUpperCase();
  const style: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size,
    height: size,
    borderRadius: size * 0.2,
    background: palette.primary,
    color: palette.onPrimary,
    fontWeight: 600,
    fontSize: size * 0.5,
    fontFamily: "system-ui, sans-serif",
    lineHeight: 1
  };
  return (
    <span
      role="img"
      aria-label={name}
      style={style}
      data-testid={rest["data-testid"]}
    >
      {initial}
    </span>
  );
}

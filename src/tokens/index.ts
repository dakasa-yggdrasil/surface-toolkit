import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";
import { brand } from "./brand";

export const tokens = { colors, spacing, typography, brand } as const;

export type Tokens = typeof tokens;
export { colors, spacing, typography, brand };
export type { BrandKey } from "./brand";

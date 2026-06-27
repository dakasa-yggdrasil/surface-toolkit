/**
 * Acronyms that should render in all-caps in UI labels rather than being
 * title-cased (e.g. "ci" -> "CI", not "Ci"). Stored upper-cased; matching is
 * case-insensitive against the input token.
 */
export const ACRONYMS = ["CI", "PR", "CD", "API", "SCIM", "SAML", "GHCR", "SSO"] as const;

const ACRONYM_SET = new Set<string>(ACRONYMS);

export interface DisplayCaseOptions {
  /**
   * When true, return the input unchanged. Use for canonical names that must
   * not be reshaped (repo slugs, external IDs), e.g.
   * `displayCase("dakasa-app-fe", { preserve: true }) === "dakasa-app-fe"`.
   */
  preserve?: boolean;
}

/**
 * Title-Case a slug-ish string into a human UI label.
 *
 * - Splits on `-`, `_`, and whitespace.
 * - Title-cases each word (first letter upper, rest lower).
 * - Keeps allowlisted acronyms (see {@link ACRONYMS}) in all-caps.
 * - Is idempotent: feeding its own output back yields the same string.
 *
 * @example displayCase("diretoria")        // "Diretoria"
 * @example displayCase("yggdrasil-admin")  // "Yggdrasil Admin"
 * @example displayCase("api-token")        // "API Token"
 */
export function displayCase(s: string, options?: DisplayCaseOptions): string {
  if (options?.preserve) return s;

  return s
    .split(/[-_\s]+/)
    .filter((w) => w.length > 0)
    .map((word) => {
      const upper = word.toUpperCase();
      if (ACRONYM_SET.has(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

import type { CSSProperties, ReactNode } from "react";
import { ADMIN_PERMS } from "../hooks/useCollaboratorScope";

/**
 * Default admin perms that may VIEW any integration surface. An
 * integration-admin / org-admin sees all surfaces regardless of which
 * integrations were granted to their teams.
 *
 * Composed from the legacy collaborator-surface admin tier ({@link ADMIN_PERMS}
 * — `manage-integrations` / `EditTeam` / `ManageTeams`) plus the canonical
 * Yggdrasil-namespaced admin perms.
 */
export const SURFACE_VIEW_ADMIN_PERMS: string[] = [
  ...ADMIN_PERMS,
  "yggdrasil:manage_integrations",
  "yggdrasil:manage_organization"
];

export interface CanViewSurfaceOptions {
  /**
   * Escape hatch: when `true`, grants view access regardless of `perms`. Use for
   * legitimate self-view cases the perm model does not express — e.g. a
   * collaborator viewing their own CLT pró-labore surface because they hold a
   * vínculo, even without a `clt.*` permission.
   */
  allow?: boolean;
  /**
   * Override the admin perms that grant view of any surface. Defaults to
   * {@link SURFACE_VIEW_ADMIN_PERMS}. When provided, it REPLACES the default
   * (not merged), so pass the full set you intend.
   */
  adminPerms?: string[];
}

/**
 * Pure predicate: may a viewer holding `perms` VIEW the surface of integration
 * `provider`?
 *
 * Honors the existing permission model — it does NOT invent permissions
 * (INTEGRATION_CONTRACT §15.3). The integration declares its perms in its
 * `surface/manifest.yaml`; granting the integration to a team extends that
 * team's effective perms; `/me` returns them as `scope.perms`. A collaborator
 * may view a surface iff they hold ≥1 permission in that integration's own
 * namespace.
 *
 * Returns `true` when ANY of:
 * - `opts.allow === true` — explicit escape hatch (see {@link CanViewSurfaceOptions.allow}).
 * - the viewer holds any perm whose id starts with `${provider}.` — i.e. the
 *   integration was granted to one of their teams (its namespace is present).
 * - the viewer holds any admin perm (default {@link SURFACE_VIEW_ADMIN_PERMS}) —
 *   an integration/org-admin sees all integration surfaces.
 *
 * Otherwise `false`.
 */
export function canViewSurface(
  perms: string[],
  provider: string,
  opts?: CanViewSurfaceOptions
): boolean {
  if (opts?.allow === true) return true;

  const adminPerms = opts?.adminPerms ?? SURFACE_VIEW_ADMIN_PERMS;
  const held = new Set(perms);
  if (adminPerms.some((p) => held.has(p))) return true;

  // Namespace match: a perm in the integration's own namespace — `provider.…`.
  // Prefix on `${provider}.` (not a bare substring) so "slack" does not match
  // "slackish.x.read".
  const nsPrefix = `${provider}.`;
  return perms.some((p) => p.startsWith(nsPrefix));
}

export interface SurfaceViewGateProps {
  /** The integration's provider/namespace key (e.g. `slack`, `aws`, `clt`). */
  provider: string;
  /** The viewer's held permissions (e.g. from `useCollaboratorScope().perms`). */
  perms: string[];
  /** Human-friendly surface name, shown in the no-access copy. */
  surfaceTitle?: string;
  /** Escape hatch — see {@link CanViewSurfaceOptions.allow}. */
  allow?: boolean;
  /** Rendered when the viewer is permitted. */
  children: ReactNode;
  /** Rendered instead of the default no-access state when access is denied. */
  fallback?: ReactNode;
}

/**
 * Gates WHO may VIEW a whole rich surface, by checking the viewer's perms
 * against the integration's own namespace (sibling of {@link CapabilityGate},
 * which gates a single dispatch action). When permitted, renders `children`;
 * otherwise renders `fallback` if given, else a calm, on-brand no-access state.
 *
 * Purely presentational: it does not fetch perms — the caller passes them in
 * (usually `useCollaboratorScope().perms`), keeping the gate testable and
 * decoupled from the auth source.
 */
export function SurfaceViewGate({
  provider,
  perms,
  surfaceTitle,
  allow,
  children,
  fallback
}: SurfaceViewGateProps) {
  if (canViewSurface(perms, provider, { allow })) {
    return <>{children}</>;
  }
  if (fallback !== undefined) {
    return <>{fallback}</>;
  }
  return <NoAccessState surfaceTitle={surfaceTitle} />;
}

/**
 * The default no-access state: a centered, warm card in the `.atelier` skin —
 * intentionally NOT a scary 403. A muted shield/lock glyph, a Fraunces title,
 * a kind line telling the viewer to ask an admin, and a subtle link back to the
 * console. Dark/light-aware purely via Atelier CSS vars (never hardcoded hex).
 */
function NoAccessState({ surfaceTitle }: { surfaceTitle?: string }) {
  const what = surfaceTitle ?? "esta surface";
  // Degrade gracefully when there is no DOM (SSR / non-browser): omit the link.
  const consoleHref = typeof window !== "undefined" ? window.location.origin : undefined;

  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "var(--sp-7)",
        fontFamily: "var(--font-body)"
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "32rem",
          gap: "var(--sp-4)",
          padding: "var(--sp-7) var(--sp-6)",
          background: "var(--sand)",
          border: "1px solid var(--line)",
          borderRadius: "var(--r-lg)",
          boxShadow: "var(--sh-soft)"
        }}
      >
        <ShieldGlyph />
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-heading)",
            fontSize: "var(--fs-2xl)",
            fontWeight: 600,
            color: "var(--ink)",
            lineHeight: 1.15
          }}
        >
          Sem acesso
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "var(--fs-md)",
            color: "var(--mut)",
            lineHeight: 1.55
          }}
        >
          Você não tem permissão para ver {what}. Peça acesso a um administrador.
        </p>
        {consoleHref ? (
          <a
            href={consoleHref}
            style={{
              fontSize: "var(--fs-sm)",
              fontWeight: 500,
              color: "var(--bronze2)",
              textDecoration: "none"
            }}
          >
            ↗ Voltar ao console
          </a>
        ) : null}
      </div>
    </div>
  );
}

/** Subtle shield-with-keyhole glyph. `currentColor` + muted so it sits calm. */
const GLYPH_STYLE: CSSProperties = { color: "var(--mut)", flex: "0 0 auto" };

function ShieldGlyph() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={GLYPH_STYLE}
    >
      <path d="M12 3 4.5 6v5c0 4.2 3.1 7.6 7.5 9 4.4-1.4 7.5-4.8 7.5-9V6L12 3Z" />
      <circle cx="12" cy="11" r="1.4" />
      <path d="M12 12.4v2.1" />
    </svg>
  );
}

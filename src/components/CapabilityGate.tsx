import type { ReactNode } from "react";

export type CapabilityNeed = string | string[];

export interface CapabilityGateProps {
  /** Required capability/permission, or several (ALL must be held). */
  need: CapabilityNeed;
  /** The viewer's held permissions (e.g. from useCollaboratorScope().perms). */
  perms: string[];
  /** Rendered only when `perms` satisfies `need`. */
  children: ReactNode;
  /** Optional content rendered when access is denied. Defaults to nothing. */
  fallback?: ReactNode;
}

/** True when `perms` satisfies `need` — every entry of an array `need`, or the
 * single string `need`. An empty-array `need` is trivially satisfied. */
export function satisfies(need: CapabilityNeed, perms: string[]): boolean {
  const held = new Set(perms);
  const required = Array.isArray(need) ? need : [need];
  return required.every((n) => held.has(n));
}

/**
 * Conditionally render children based on the viewer's held permissions. Purely
 * presentational — it does NOT fetch perms; the caller passes them in (usually
 * from `useCollaboratorScope().perms`). This keeps gating testable and avoids
 * coupling the toolkit to a particular auth source.
 */
export function CapabilityGate({ need, perms, children, fallback = null }: CapabilityGateProps) {
  return <>{satisfies(need, perms) ? children : fallback}</>;
}

/**
 * Hook form: given the viewer's `perms`, returns a predicate `(need) => boolean`
 * for imperative checks (e.g. disabling a button) where a wrapper component is
 * awkward.
 */
export function useCapability(perms: string[]): (need: CapabilityNeed) => boolean {
  return (need: CapabilityNeed) => satisfies(need, perms);
}

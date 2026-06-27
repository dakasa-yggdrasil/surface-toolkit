import { useQueries } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";
import { useCurrentCollaborator } from "./useCurrentCollaborator";
import type { CollaboratorT, CurrentCollaboratorResult } from "./useCurrentCollaborator";
import type { ProvisioningEntryT } from "./useTeamExternalId";

/** Permissions that grant the `admin` tier on the collaborator surface. */
export const ADMIN_PERMS = ["manage-integrations", "EditTeam", "ManageTeams"] as const;
/** Membership roles that grant at least the `lead` tier. */
const LEAD_ROLES = new Set(["lead", "owner"]);
/** Integration type whose external_id is the team's GitHub slug. */
const GITHUB_TYPE = "github";

export type CollaboratorTier = "member" | "lead" | "admin";

export interface ScopedTeam {
  teamId: string;
  slug: string;
  /** The team's provisioned GitHub slug, when resolved. */
  githubSlug?: string;
}

export interface CollaboratorScope {
  collaborator: CollaboratorT | undefined;
  teams: ScopedTeam[];
  tier: CollaboratorTier;
  perms: string[];
  isLoading: boolean;
  isError: boolean;
}

interface ProvisioningStatusResponse {
  team_id: string;
  provisioning: ProvisioningEntryT[];
  pending: ProvisioningEntryT[];
  dead_lettered: ProvisioningEntryT[];
}

// /me may carry a `permissions` array (a parallel change is adding it). Read it
// defensively so this hook works before/after that lands.
type MeWithPerms = CurrentCollaboratorResult & { permissions?: string[] };

/**
 * Composes the viewer's scope for the collaborator-centric surface:
 * `{ collaborator, teams, tier, perms }`.
 *
 * - `collaborator` + `perms` + memberships come from `useCurrentCollaborator()`
 *   (GET /me). `perms` reads `me.permissions ?? []`.
 * - each membership's `githubSlug` is resolved by fanning out one
 *   GET /teams/{id}/provisioning-status per team (v1 — N calls; acceptable for
 *   the small number of teams a collaborator belongs to) and picking the
 *   GitHub-typed provisioning entry's external_id (same shape used by
 *   {@link useTeamExternalId}).
 * - `tier` is `admin` if any perm is in {@link ADMIN_PERMS}; else `lead` if any
 *   membership role is lead/owner; else `member`.
 */
export function useCollaboratorScope(): CollaboratorScope {
  const api = useYggdrasilAPI();
  const me = useCurrentCollaborator();

  const memberships = me.data?.memberships ?? [];

  const provQueries = useQueries({
    queries: memberships.map((m) => ({
      queryKey: ["team-external-id", m.team_id, GITHUB_TYPE],
      enabled: !!me.data,
      queryFn: () =>
        api.get<ProvisioningStatusResponse>(`/teams/${m.team_id}/provisioning-status`),
      staleTime: 15_000
    }))
  });

  const perms = (me.data as MeWithPerms | undefined)?.permissions ?? [];

  const teams: ScopedTeam[] = memberships.map((m, i) => {
    const data = provQueries[i]?.data;
    const githubEntry = data?.provisioning.find(
      (p) => (p as { integration_type?: string }).integration_type === GITHUB_TYPE
    );
    return {
      teamId: m.team_id,
      slug: m.team_slug,
      githubSlug: githubEntry?.external_id
    };
  });

  const tier = deriveTier(perms, memberships.map((m) => m.role));

  const provLoading = provQueries.some((q) => q.isLoading && q.fetchStatus !== "idle");
  const provError = provQueries.some((q) => q.isError);

  return {
    collaborator: me.data?.collaborator,
    teams,
    tier,
    perms,
    isLoading: me.isLoading || provLoading,
    isError: me.isError || provError
  };
}

function deriveTier(perms: string[], roles: string[]): CollaboratorTier {
  const held = new Set(perms);
  if (ADMIN_PERMS.some((p) => held.has(p))) return "admin";
  if (roles.some((r) => LEAD_ROLES.has(r))) return "lead";
  return "member";
}

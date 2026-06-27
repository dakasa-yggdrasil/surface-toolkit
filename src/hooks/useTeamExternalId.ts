import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export interface ProvisioningEntryT {
  integration_instance_id: string;
  external_id: string;
  external_metadata: unknown;
  [key: string]: unknown;
}

interface ProvisioningStatusResponse {
  team_id: string;
  provisioning: ProvisioningEntryT[];
  pending: ProvisioningEntryT[];
  dead_lettered: ProvisioningEntryT[];
}

export interface TeamExternalIdResult {
  externalId: string | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  // true when the query succeeded but no provisioning entry matched the
  // instance — i.e. the team is not (yet) provisioned on that integration.
  // Distinct from still-loading.
  notProvisioned: boolean;
}

// GET /api/v1/teams/{teamId}/provisioning-status — resolves a team's
// PROVISIONED external id for a given integration instance. The external
// id differs from the yggdrasil team slug (e.g. GitHub derives its team
// slug from the team NAME, not the yggdrasil slug). Skipped until both
// teamId and instanceId are known.
export function useTeamExternalId(
  teamId: string | undefined,
  instanceId: string | undefined
): TeamExternalIdResult {
  const api = useYggdrasilAPI();
  const query = useQuery({
    queryKey: ["team-external-id", teamId, instanceId],
    enabled: !!teamId && !!instanceId,
    queryFn: () =>
      api.get<ProvisioningStatusResponse>(`/teams/${teamId}/provisioning-status`),
    staleTime: 15_000
  });

  const entry = query.data?.provisioning.find(
    (p) => p.integration_instance_id === instanceId
  );

  return {
    externalId: entry?.external_id,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    notProvisioned: query.isSuccess && entry === undefined
  };
}

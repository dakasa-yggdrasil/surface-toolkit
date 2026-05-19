import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export interface RunT {
  id: string;
  workflow_name: string;
  status: string;
  started_at: string;
  duration_ms?: number;
  capability?: string;
}

export interface RecentRunsResult {
  items: RunT[];
  total: number;
}

interface OpsAuditResponse {
  events?: Array<{
    id: string;
    actor?: string;
    action: string;
    target_kind?: string;
    target_id?: string;
    result_status?: string;
    created_at: string;
  }>;
  count?: number;
}

// Yggdrasil-core does not expose a workflow-runs LIST endpoint. We use
// /ops/audit filtered by target_kind=workflow_run to approximate "recent
// runs touching this integration's resources". target_id is namespaced
// like "dakasa/<workflow-name>" so we can't strictly filter per instance
// — the caller surface filters client-side if needed.
export function useRecentRuns(instanceId: string | undefined, limit = 25) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["recent-runs", instanceId, limit],
    enabled: !!instanceId,
    queryFn: async (): Promise<RecentRunsResult> => {
      const resp = await api.get<OpsAuditResponse>(
        `/ops/audit?target_kind=workflow_run&limit=${limit}`
      );
      const items: RunT[] = (resp.events ?? []).map((e) => ({
        id: e.id,
        workflow_name: e.target_id ?? "unknown",
        status: e.result_status ?? e.action.replace("workflow_run.", ""),
        started_at: e.created_at,
        capability: e.action
      }));
      return { items, total: resp.count ?? items.length };
    },
    staleTime: 10_000
  });
}

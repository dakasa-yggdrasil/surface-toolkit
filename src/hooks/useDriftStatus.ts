import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export interface DriftItemT {
  id: string;
  resource_kind: string;
  name: string;
  integration: string;
  severity: string;
  last_reconcile_at?: string;
  diff?: Record<string, unknown>;
}

export interface DriftStatusT {
  items: DriftItemT[];
  in_sync: boolean;
  last_sync_at?: string;
}

interface OpsDriftResponse {
  drift?: DriftItemT[];
}

// /ops/drift returns ALL drift across the org. Surfaces filter client-side
// by integration (provider name on each drift row) so they show only their
// own slice. in_sync = filtered list is empty.
export function useDriftStatus(integrationType: string) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["drift", integrationType],
    queryFn: async (): Promise<DriftStatusT> => {
      const resp = await api.get<OpsDriftResponse>(`/ops/drift?limit=200`);
      const all = resp.drift ?? [];
      const mine = all.filter((d) => d.integration === integrationType);
      const lastSync = mine.reduce<string | undefined>((acc, d) => {
        if (!d.last_reconcile_at) return acc;
        if (!acc || d.last_reconcile_at > acc) return d.last_reconcile_at;
        return acc;
      }, undefined);
      return { items: mine, in_sync: mine.length === 0, last_sync_at: lastSync };
    },
    staleTime: 60_000
  });
}

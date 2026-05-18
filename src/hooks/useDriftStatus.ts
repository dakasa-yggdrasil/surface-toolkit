import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export interface DriftStatusT {
  in_sync: boolean;
  last_sync_at?: string;
  declared_version?: string;
  running_version?: string;
  failures?: Array<{ field: string; reason: string }>;
}

export function useDriftStatus(integrationType: string) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["drift", integrationType],
    queryFn: () => api.get<DriftStatusT>(`/integration-types/${integrationType}/drift`),
    staleTime: 60_000
  });
}

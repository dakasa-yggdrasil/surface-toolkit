import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export interface InstanceT {
  id: string;
  integration_type: string;
  name?: string;
  config?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export function useInstance(instanceId: string | undefined) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["instance", instanceId],
    enabled: !!instanceId,
    queryFn: () => api.get<InstanceT>(`/integration-instances/${instanceId}`),
    staleTime: 30_000
  });
}

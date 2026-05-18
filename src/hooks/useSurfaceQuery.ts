import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export function useSurfaceQuery<TResult = unknown>(
  instanceId: string | undefined,
  queryName: string,
  params: Record<string, unknown> = {}
) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["surface-query", instanceId, queryName, params],
    enabled: !!instanceId,
    queryFn: () =>
      api.post<TResult>(`/integrations/${instanceId}/surface-query`, {
        query_name: queryName,
        params
      }),
    staleTime: 15_000
  });
}

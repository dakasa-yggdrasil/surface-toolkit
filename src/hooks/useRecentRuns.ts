import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export interface RunT {
  id: string;
  workflow_name: string;
  status: "running" | "success" | "failed" | "queued";
  started_at: string;
  duration_ms?: number;
  capability?: string;
}

export interface RecentRunsResult {
  items: RunT[];
  total: number;
}

export function useRecentRuns(instanceId: string | undefined, limit = 25) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["recent-runs", instanceId, limit],
    enabled: !!instanceId,
    queryFn: () =>
      api.get<RecentRunsResult>(
        `/workflow-runs?integration_instance_id=${instanceId}&limit=${limit}&order=desc`
      ),
    staleTime: 10_000
  });
}

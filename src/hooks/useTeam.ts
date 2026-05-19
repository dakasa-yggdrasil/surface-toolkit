import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export interface TeamT {
  id: string;
  slug: string;
  name: string;
  type?: string;
  status: string;
  parent_team_id?: string;
  owners?: string[];
  metadata?: Record<string, unknown>;
}

interface ApiResp {
  team: TeamT;
}

// GET /api/v1/teams/{id} — wrapper for the team header card. Skipped
// when teamId is undefined (which happens during the brief mount loop
// before the collaborator + primary_team_id are known).
export function useTeam(teamId: string | undefined) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["team", teamId],
    enabled: !!teamId,
    queryFn: async (): Promise<TeamT> => {
      const resp = await api.get<ApiResp>(`/teams/${teamId}`);
      return resp.team;
    },
    staleTime: 60_000
  });
}

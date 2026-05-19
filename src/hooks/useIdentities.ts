import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";
import type { IdentityT } from "../components/IdentityRow";

export interface IdentitiesResult {
  items: IdentityT[];
  total: number;
}

export interface UseIdentitiesOpts {
  integrationType?: string;
  instanceId?: string;
  status?: "active" | "soft_deleted" | "all";
}

interface ApiResponse {
  identities?: IdentityT[];
  total?: number;
}

// /collaborator-external-identities returns {identities: [...]}; we reshape
// to {items, total} for ergonomic match with the other "list" hooks. Empty
// or missing identities is fine (returns items: []).
export function useIdentities(opts: UseIdentitiesOpts) {
  const api = useYggdrasilAPI();
  const params = new URLSearchParams();
  if (opts.integrationType) params.set("integration_type", opts.integrationType);
  if (opts.instanceId) params.set("instance_id", opts.instanceId);
  if (opts.status && opts.status !== "all") params.set("status", opts.status);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return useQuery({
    queryKey: ["identities", opts],
    queryFn: async (): Promise<IdentitiesResult> => {
      const resp = await api.get<ApiResponse>(`/collaborator-external-identities${qs}`);
      const items = resp.identities ?? [];
      return { items, total: resp.total ?? items.length };
    },
    staleTime: 15_000
  });
}

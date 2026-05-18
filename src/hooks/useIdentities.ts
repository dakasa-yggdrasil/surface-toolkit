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

export function useIdentities(opts: UseIdentitiesOpts) {
  const api = useYggdrasilAPI();
  const params = new URLSearchParams();
  if (opts.integrationType) params.set("integration_type", opts.integrationType);
  if (opts.instanceId) params.set("instance_id", opts.instanceId);
  if (opts.status && opts.status !== "all") params.set("status", opts.status);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return useQuery({
    queryKey: ["identities", opts],
    queryFn: () => api.get<IdentitiesResult>(`/collaborator-external-identities${qs}`),
    staleTime: 15_000
  });
}

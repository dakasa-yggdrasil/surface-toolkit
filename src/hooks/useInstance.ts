import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export interface InstanceT {
  id: string;
  integration_type: string;
  name?: string;
  namespace?: string;
  config?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

interface ListResp {
  manifests?: Array<{
    id: string;
    metadata: { name: string; namespace?: string };
    spec?: { type_ref?: { name?: string }; config?: Record<string, unknown> };
    created_at?: string;
    updated_at?: string;
  }>;
}

// Yggdrasil-core exposes integration_instances only via the LIST endpoint
// (no GET-by-id), so we fetch the kind=integration_instance list and pick
// the one matching the id we were given. Cached for 30s so deep-linking
// from InstancePicker doesn't refetch on every tab switch.
export function useInstance(instanceId: string | undefined) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["instance", instanceId],
    enabled: !!instanceId,
    queryFn: async (): Promise<InstanceT> => {
      const resp = await api.get<ListResp>(
        `/manifests?kind=integration_instance&limit=200`
      );
      const match = (resp.manifests ?? []).find((m) => m.id === instanceId);
      if (!match) {
        throw new Error(`instance ${instanceId} not found`);
      }
      return {
        id: match.id,
        integration_type: match.spec?.type_ref?.name ?? "unknown",
        name: match.metadata.name,
        namespace: match.metadata.namespace,
        config: match.spec?.config,
        created_at: match.created_at,
        updated_at: match.updated_at
      };
    },
    staleTime: 30_000
  });
}

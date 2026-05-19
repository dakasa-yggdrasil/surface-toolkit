import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";
import type { InstanceT } from "./useInstance";

interface ListResponse {
  manifests?: Array<{
    id: string;
    metadata: { name: string; namespace?: string; description?: string };
    spec?: { type_ref?: { name?: string }; config?: Record<string, unknown> };
  }>;
}

// Returns the integration_instance manifests filtered down to a specific
// integration type (e.g. "github"). The list endpoint is generic — we
// shape it into the same InstanceT used everywhere else for ergonomics.
export function useInstancesList(integrationType: string) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["instances-list", integrationType],
    queryFn: async (): Promise<InstanceT[]> => {
      const resp = await api.get<ListResponse>(
        `/manifests?kind=integration_instance&limit=200`
      );
      const items = resp.manifests ?? [];
      return items
        .filter((m) => m.spec?.type_ref?.name === integrationType)
        .map((m) => ({
          id: m.id,
          integration_type: integrationType,
          name: m.metadata.name,
          config: m.spec?.config
        }));
    },
    staleTime: 60_000
  });
}

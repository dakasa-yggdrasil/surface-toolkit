import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export interface ActionDef {
  name: string;
  description?: string;
  resource_types?: string[];
  idempotent?: boolean;
}

export interface ActionCatalogResult {
  items: ActionDef[];
}

interface IntegrationTypeManifest {
  manifests?: Array<{
    spec?: {
      action_catalog?: ActionDef[];
    };
  }>;
}

// The action catalog lives inside the integration_type manifest's
// spec.action_catalog, refreshed by the manifest_sync addon whenever the
// adapter's describe contract changes. There is no dedicated
// /action-catalog endpoint, so we read the manifest directly.
export function useActionCatalog(integrationType: string) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["action-catalog", integrationType],
    queryFn: async (): Promise<ActionCatalogResult> => {
      const resp = await api.get<IntegrationTypeManifest>(
        `/manifests?kind=integration_type&name=${encodeURIComponent(integrationType)}&namespace=global`
      );
      const items = resp.manifests?.[0]?.spec?.action_catalog ?? [];
      return { items };
    },
    staleTime: 5 * 60_000
  });
}

import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export interface ActionDef {
  name: string;
  resource_types?: string[];
  inputs?: Record<string, unknown>;
}

export interface ActionCatalogResult {
  items: ActionDef[];
}

export function useActionCatalog(integrationType: string) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["action-catalog", integrationType],
    queryFn: () =>
      api.get<ActionCatalogResult>(`/action-catalog?integration_type=${encodeURIComponent(integrationType)}`),
    staleTime: 5 * 60_000
  });
}

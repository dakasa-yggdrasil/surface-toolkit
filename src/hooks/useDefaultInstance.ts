import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

interface ListResp {
  manifests?: Array<{
    id: string;
    metadata: { name: string; namespace?: string };
    spec?: { type_ref?: { name?: string } };
  }>;
}

// Picks the first integration_instance of a given type. Used when the
// surface is in "team-centric" mode and only needs *some* instance to
// proxy surface queries against (e.g. list-repos). The instance is
// effectively a routing handle — the actual data scope comes from the
// team context.
export function useDefaultInstance(integrationType: string) {
  const api = useYggdrasilAPI();
  return useQuery({
    queryKey: ["default-instance", integrationType],
    queryFn: async (): Promise<string | undefined> => {
      const resp = await api.get<ListResp>(
        `/manifests?kind=integration_instance&limit=200`
      );
      const match = (resp.manifests ?? []).find(
        (m) => m.spec?.type_ref?.name === integrationType
      );
      return match?.id;
    },
    staleTime: 5 * 60_000
  });
}

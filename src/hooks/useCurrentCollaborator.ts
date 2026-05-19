import { useQuery } from "@tanstack/react-query";
import { useYggdrasilAPI } from "./useYggdrasilAPI";

export interface CollaboratorT {
  id: string;
  slug: string;
  display_name: string;
  primary_email: string;
  primary_team_id?: string;
  status: string;
}

export interface MembershipT {
  id: string;
  team_id: string;
  team_slug: string;
  collaborator_id: string;
  role: string;
  active: boolean;
  source?: string;
}

export interface CurrentCollaboratorResult {
  collaborator: CollaboratorT;
  memberships: MembershipT[];
}

interface CollabResp {
  collaborator: CollaboratorT;
}
interface MembershipsResp {
  memberships: MembershipT[];
}

// GET /api/v1/me — backed by the session cookie or bearer token. Returns
// the collaborator and their active team memberships in one round-trip
// so every surface can bootstrap "my context" without three API calls.
//
// In Vite dev mode the admin token in the proxy is a service identity,
// not a real session, so /me will 401. When VITE_DEV_AS_USER is set we
// fall back to GET /collaborators/<slug> + /team-memberships so the
// team-centric shell still has a person to anchor on. Never reached in
// prod (the env var is undefined there).
export function useCurrentCollaborator() {
  const api = useYggdrasilAPI();
  const devSlug =
    typeof import.meta !== "undefined" &&
    (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_DEV_AS_USER;

  return useQuery({
    queryKey: ["me", devSlug ?? "session"],
    queryFn: async (): Promise<CurrentCollaboratorResult> => {
      try {
        return await api.get<CurrentCollaboratorResult>(`/me`);
      } catch (err) {
        if (devSlug) {
          const c = await api.get<CollabResp>(`/collaborators/${devSlug}`);
          const m = await api.get<MembershipsResp>(
            `/team-memberships?collaborator_id=${c.collaborator.id}`
          );
          return {
            collaborator: c.collaborator,
            memberships: (m.memberships ?? []).filter((x) => x.active)
          };
        }
        throw err;
      }
    },
    staleTime: 5 * 60_000,
    retry: false
  });
}

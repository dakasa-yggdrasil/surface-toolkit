# Hooks reference

Every hook exported by `@dakasa-yggdrasil/surface-toolkit`, its signature, the
core endpoint it reads, and its return shape. Signatures are taken directly from
`src/hooks/`.

> All data hooks (except `useYggdrasilAPI`) are **React Query** hooks — they
> return a `UseQueryResult` (`{ data, isLoading, error, … }`) and must run under
> a `QueryClientProvider`. Every request rides `useYggdrasilAPI`, which `fetch`es
> with `credentials: "include"` so the **delegated Yggdrasil session cookie** is
> sent. Surfaces never reimplement auth and never call providers directly.

| Hook | Reads | Returns (`data`) |
|---|---|---|
| `useYggdrasilAPI` | — (factory) | `{ get, post, del }` |
| `useSurfaceQuery` | `POST /integrations/{id}/surface-query` | `TResult` |
| `useInstance` | `GET /manifests?kind=integration_instance` | `InstanceT` |
| `useInstancesList` | `GET /manifests?kind=integration_instance` | `InstanceT[]` |
| `useDefaultInstance` | `GET /manifests?kind=integration_instance` | `string \| undefined` |
| `useCurrentCollaborator` | `GET /me` (dev fallback) | `CurrentCollaboratorResult` |
| `useTeam` | `GET /teams/{id}` | `TeamT` |
| `useDriftStatus` | `GET /ops/drift` | `DriftStatusT` |
| `useIdentities` | `GET /collaborator-external-identities` | `IdentitiesResult` |
| `useActionCatalog` | `GET /manifests?kind=integration_type` | `ActionCatalogResult` |
| `useRecentRuns` | `GET /ops/audit?target_kind=workflow_run` | `RecentRunsResult` |
| `useWebhookLog` | `GET /ops/audit?action_prefix=webhook` | `WebhookLogResult` |

All paths are relative to the API base (default `/api/v1`).

---

## `useYggdrasilAPI`

The transport every other hook is built on.

```ts
function useYggdrasilAPI(opts?: { baseUrl?: string }): {
  get:  <T>(path: string) => Promise<T>;
  post: <T>(path: string, body: unknown) => Promise<T>;
  del:  <T>(path: string) => Promise<T>;
};
```

- `baseUrl` defaults to `/api/v1` (trailing slash trimmed).
- Every request sets `credentials: "include"`; `post` sends JSON.
- Non-2xx throws `Error("<status> <statusText>: <body>")`; `204` resolves to
  `undefined`.

```tsx
const api = useYggdrasilAPI();
const team = await api.get<{ team: TeamT }>("/teams/abc");
await api.post("/integrations/i1/surface-query", { query_name: "list-channels", params: {} });
```

---

## `useSurfaceQuery`

Run a named surface query against an instance's adapter. This is the main escape
hatch for integration-specific data.

```ts
function useSurfaceQuery<TResult = unknown>(
  instanceId: string | undefined,
  queryName: string,
  params?: Record<string, unknown>,
): UseQueryResult<TResult>;
```

- `POST`s `{ query_name, params }` to `/integrations/{instanceId}/surface-query`.
- Disabled while `instanceId` is falsy. `staleTime` 15s.

```tsx
const { data } = useSurfaceQuery<{ items: Channel[] }>(instanceId, "list-channels", { archived: false });
```

---

## `useInstance`

Resolve a single `integration_instance` by id.

```ts
function useInstance(instanceId: string | undefined): UseQueryResult<InstanceT>;

interface InstanceT {
  id: string;
  integration_type: string;
  name?: string;
  namespace?: string;
  config?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}
```

Core has no GET-by-id for instances, so this lists
`?kind=integration_instance&limit=200` and picks the match. Disabled while
`instanceId` is falsy. `staleTime` 30s. Throws if the id isn't found.

---

## `useInstancesList`

All instances of one integration type (drives `InstancePicker`).

```ts
function useInstancesList(integrationType: string): UseQueryResult<InstanceT[]>;
```

Lists `?kind=integration_instance&limit=200` and filters by
`spec.type_ref.name`. `staleTime` 60s.

---

## `useDefaultInstance`

The first instance id of a type — used by team-centric surfaces that only need
*some* instance to proxy queries against.

```ts
function useDefaultInstance(integrationType: string): UseQueryResult<string | undefined>;
```

`staleTime` 5min.

---

## `useCurrentCollaborator`

"My context": the calling collaborator plus their active team memberships, in one
round-trip.

```ts
function useCurrentCollaborator(): UseQueryResult<CurrentCollaboratorResult>;

interface CurrentCollaboratorResult {
  collaborator: CollaboratorT;   // id, slug, display_name, primary_email, primary_team_id?, status
  memberships: MembershipT[];    // id, team_id, team_slug, collaborator_id, role, active, source?
}
```

Calls `GET /me`. `retry: false`, `staleTime` 5min.

> **Dev fallback:** in Vite dev, the proxy uses a service identity so `/me` 401s.
> Set `VITE_DEV_AS_USER=<slug>` and the hook falls back to
> `GET /collaborators/{slug}` + `GET /team-memberships?collaborator_id=…` (active
> only). Never reached in production.

---

## `useTeam`

Single team by id (header card).

```ts
function useTeam(teamId: string | undefined): UseQueryResult<TeamT>;

interface TeamT {
  id: string; slug: string; name: string;
  type?: string; status: string; parent_team_id?: string;
  owners?: string[]; metadata?: Record<string, unknown>;
}
```

Calls `GET /teams/{id}`. Disabled while `teamId` is falsy. `staleTime` 60s.

---

## `useDriftStatus`

Reconciliation drift for one integration.

```ts
function useDriftStatus(integrationType: string): UseQueryResult<DriftStatusT>;

interface DriftStatusT {
  items: DriftItemT[];          // id, resource_kind, name, integration, severity, last_reconcile_at?, diff?
  in_sync: boolean;             // items.length === 0
  last_sync_at?: string;        // max last_reconcile_at
}
```

`/ops/drift` returns org-wide drift; this filters client-side by `integration ===
integrationType`. `staleTime` 60s.

---

## `useIdentities`

Linked external identities (collaborator ↔ provider account).

```ts
function useIdentities(opts: {
  integrationType?: string;
  instanceId?: string;
  status?: "active" | "soft_deleted" | "all";
}): UseQueryResult<IdentitiesResult>;

interface IdentitiesResult { items: IdentityT[]; total: number }
```

`GET /collaborator-external-identities` with the provided filters as query params
(`status: "all"` omits the filter). Reshapes `{ identities }` → `{ items, total }`.
`staleTime` 15s. `IdentityT` is defined in [COMPONENTS.md](./COMPONENTS.md#identityrow).

---

## `useActionCatalog`

The actions an integration declares (from its `integration_type` manifest's
`spec.action_catalog`, kept fresh by the manifest-sync addon).

```ts
function useActionCatalog(integrationType: string): UseQueryResult<ActionCatalogResult>;

interface ActionDef { name: string; description?: string; resource_types?: string[]; idempotent?: boolean }
interface ActionCatalogResult { items: ActionDef[] }
```

`GET /manifests?kind=integration_type&name=<type>&namespace=global`. `staleTime`
5min.

---

## `useRecentRuns`

Recent workflow runs, approximated from the audit log (core has no workflow-runs
LIST endpoint).

```ts
function useRecentRuns(instanceId: string | undefined, limit?: number): UseQueryResult<RecentRunsResult>;

interface RunT { id: string; workflow_name: string; status: string; started_at: string; duration_ms?: number; capability?: string }
interface RecentRunsResult { items: RunT[]; total: number }
```

`GET /ops/audit?target_kind=workflow_run&limit=<limit>` (default `limit` 25).
Disabled while `instanceId` is falsy. `staleTime` 10s. Audit entries aren't
strictly per-instance — filter client-side if you need that.

---

## `useWebhookLog`

Recent webhook deliveries, from the audit log.

```ts
function useWebhookLog(instanceId: string | undefined, limit?: number): UseQueryResult<WebhookLogResult>;

interface WebhookEventT { id: string; event_type: string; signature_verified: boolean; received_at: string; payload_preview?: string }
interface WebhookLogResult { items: WebhookEventT[]; total: number }
```

`GET /ops/audit?action_prefix=webhook&limit=<limit>` (default `limit` 50).
`signature_verified` is derived from `result_status === "success"`;
`payload_preview` is undefined (audit doesn't carry bodies). Disabled while
`instanceId` is falsy. `staleTime` 10s.

---

## See also

- [COMPONENTS.md](./COMPONENTS.md) — components and pre-built tabs built on these hooks.
- [USAGE.md](./USAGE.md) — wiring a surface end-to-end.
</content>

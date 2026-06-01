# Usage

End-to-end guide for building a Yggdrasil integration surface on top of
`@dakasa-yggdrasil/surface-toolkit`: install → wrap providers → mount a shell →
add a custom tab → verify.

> New to the project? Read the [README](../README.md) and
> [yggdrasil-core](https://github.com/dakasa-yggdrasil/yggdrasil-core) first.
> A *surface* is the internal-team console UI for one integration — it presents
> and dispatches company-owned resources, it never decides business rules and it
> never talks to the provider directly (everything goes through the core API on
> the delegated session).

---

## 1. Install

The package is published to **GitHub Packages**. Scope the registry, then install:

```bash
# .npmrc (repo root)
@dakasa-yggdrasil:registry=https://npm.pkg.github.com
```

```bash
npm install @dakasa-yggdrasil/surface-toolkit
```

Provide the peer dependencies in your surface (they are **not** bundled):

```bash
npm install react@^19 react-dom@^19 react-router-dom@^7 \
  @tanstack/react-query@^5 @mui/material@^6 @emotion/react@^11 @emotion/styled@^11
```

---

## 2. Wrap the surface in providers

Mount these once near the root, in this order:

1. `QueryClientProvider` — React Query, used by every data hook.
2. `SurfaceThemeProvider` — applies `surfaceTheme` + `CssBaseline`.
3. `BrowserRouter` — the shells use `react-router-dom` params/navigation.

```tsx
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SurfaceThemeProvider } from "@dakasa-yggdrasil/surface-toolkit";

const queryClient = new QueryClient();

export function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <SurfaceThemeProvider>
        <BrowserRouter basename="/s/slack">
          <App />
        </BrowserRouter>
      </SurfaceThemeProvider>
    </QueryClientProvider>
  );
}
```

The `basename` is where the console mounts your surface (e.g. `/s/slack`). Keep
it consistent with the `basePath` you pass to the shell.

---

## 3. Wrap an integration surface in `IntegrationAdminShell`

`IntegrationAdminShell` is the instance-centric shell. You give it the
`integrationType`, a `basePath`, and a list of `tabs`; it owns the rest:

- reads `:instanceId` / `:tabId` from the URL,
- loads the instance via `useInstance` (showing `LoadingState` / `EmptyState`),
- renders a `PageHeader` + `Tabs`,
- redirects `…/instance/:id` → `…/instance/:id/<first-tab>`.

A tab is `{ id, label, component }` where `component` is rendered with
`{ instanceId, integrationType }` props.

```tsx
import { Routes, Route } from "react-router-dom";
import {
  IntegrationAdminShell,
  InstancePicker,
  OverviewTab,
  DriftTab,
  IdentitiesTab,
  RecentRunsTab,
} from "@dakasa-yggdrasil/surface-toolkit";

const tabs = [
  { id: "overview", label: "Overview", component: OverviewTab },
  { id: "drift", label: "Drift", component: DriftTab },
  { id: "identities", label: "Identities", component: IdentitiesTab },
  { id: "runs", label: "Recent runs", component: RecentRunsTab },
];

export function App() {
  return (
    <Routes>
      {/* Landing route: pick an instance of this integration type */}
      <Route
        path="/"
        element={
          <InstancePicker
            integrationType="slack"
            hrefForInstance={(id) => `/instance/${id}`}
          />
        }
      />

      {/* Instance admin: shell owns tabs + the :tabId routing */}
      <Route
        path="/instance/:instanceId/:tabId?"
        element={
          <IntegrationAdminShell
            integrationType="slack"
            basePath="/s/slack"
            tabs={tabs}
            title="Slack"
            subtitle="Workspace admin"
          />
        }
      />
    </Routes>
  );
}
```

### URL contract

`IntegrationAdminShell` expects these routes to resolve to it:

| Path | Behaviour |
|---|---|
| `…/instance/:instanceId` | Redirects to the first tab. |
| `…/instance/:instanceId/:tabId` | Renders the matching tab. |

`InstancePicker` renders on `/` and deep-links each instance card via your
`hrefForInstance(id)` callback (relative to the router `basename`).

---

## 4. Add a custom tab with `useSurfaceQuery`

Built-in tabs cover the cross-integration signals (drift, identities, runs,
webhooks, the action catalog). For integration-specific data, write your own tab
and call `useSurfaceQuery`, which `POST`s to
`/integrations/:instanceId/surface-query` with a `query_name` your adapter
exposes via its describe contract.

```tsx
import { useSurfaceQuery, DataTable, LoadingState, EmptyState } from "@dakasa-yggdrasil/surface-toolkit";

interface Channel extends Record<string, unknown> {
  id: string;
  name: string;
  members: number;
}

export function ChannelsTab({ instanceId }: { instanceId: string; integrationType: string }) {
  const { data, isLoading } = useSurfaceQuery<{ items: Channel[] }>(
    instanceId,
    "list-channels",          // a query_name your adapter declares
    { archived: false },      // params forwarded to the adapter
  );

  if (isLoading) return <LoadingState />;
  if (!data?.items?.length) return <EmptyState title="No channels" />;

  return (
    <DataTable<Channel>
      rows={data.items}
      keyField="id"
      columns={[
        { id: "name", header: "Channel", accessor: (r) => r.name, sortable: true },
        { id: "members", header: "Members", accessor: (r) => r.members, sortable: true },
      ]}
    />
  );
}
```

Add it to the `tabs` array exactly like a built-in tab:

```tsx
const tabs = [
  { id: "overview", label: "Overview", component: OverviewTab },
  { id: "channels", label: "Channels", component: ChannelsTab },
];
```

> Prefer the generic `ResourcesTab` if your adapter exposes a standard
> `list-resources` query returning `{ items: [{ id, name, kind }] }` — it wraps
> `useSurfaceQuery` + `DataTable` for you. See
> [COMPONENTS.md](./COMPONENTS.md#pre-built-tabs).

---

## 5. Team-centric surfaces with `TeamContextShell`

Some surfaces are anchored on a **team** rather than a specific instance (e.g. "is
my team's integration healthy?"). `TeamContextShell` resolves the current
collaborator, their primary/selected team, and a default instance, then renders
team tabs with `{ teamId, instanceId, integrationType }` props.

```tsx
import { Routes, Route } from "react-router-dom";
import { TeamContextShell, TeamOverviewTab } from "@dakasa-yggdrasil/surface-toolkit";

const teamTabs = [
  { id: "overview", label: "Overview", component: TeamOverviewTab },
];

export function App() {
  return (
    <Routes>
      {/* "/" auto-routes to /team/<primary_team_id>/<first-tab> */}
      <Route path="/" element={<TeamContextShell integrationType="github" basePath="/" tabs={teamTabs} />} />
      <Route path="/team/:teamId" element={<TeamContextShell integrationType="github" basePath="/" tabs={teamTabs} />} />
      <Route path="/team/:teamId/:tabId" element={<TeamContextShell integrationType="github" basePath="/" tabs={teamTabs} />} />
    </Routes>
  );
}
```

URL contract:

| Path | Behaviour |
|---|---|
| `/` | Routes to `/team/<primary_team_id>/<first-tab>`. |
| `/team/:teamId` | Redirects to the first tab. |
| `/team/:teamId/:tabId` | Renders the tab. |

If the caller is anonymous (`/me` 401s) or has no team, the shell renders a clear
empty state instead of crashing. When the collaborator belongs to more than one
team, a team switcher appears in the header.

> **Dev mode:** `/me` returns a service identity in the Vite proxy, so it 401s.
> Set `VITE_DEV_AS_USER=<collaborator-slug>` and `useCurrentCollaborator` falls
> back to `/collaborators/{slug}` + `/team-memberships`. This path is never
> reached in production.

---

## 6. Verify the run

1. Start your surface dev server (`npm run dev` in the surface, with the Vite
   proxy pointed at yggdrasil-core).
2. Open the surface under the console (`/s/<type>/`). `InstancePicker` (or the
   team shell) should list real `integration_instance` manifests from core — if
   the list is empty, create one with `yggdrasil apply` and an
   `integration_instance` manifest.
3. Drill into an instance/team. The built-in tabs should populate from
   `/ops/drift`, `/ops/audit`, `/collaborator-external-identities`, and the
   instance manifest.
4. If a panel shows "could not load", check the browser network tab — every call
   should be a `200` to `/api/v1/*` carrying the session cookie. A `401` means
   the surface is not mounted under an authenticated console session.

---

## See also

- [COMPONENTS.md](./COMPONENTS.md) — every component, its props, and a snippet.
- [HOOKS.md](./HOOKS.md) — every hook, its signature, return shape, and the core
  endpoint it reads.
- [DEVELOPMENT.md](./DEVELOPMENT.md) — build, test, and publish.
</content>

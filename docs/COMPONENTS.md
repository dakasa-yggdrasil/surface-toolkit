# Components reference

Every component, type, and token exported by
`@dakasa-yggdrasil/surface-toolkit`, with props and a minimal snippet. All
exports come from the package root unless noted. Props are derived directly from
the source in `src/`.

> Built on **MUI 6** + **react-router-dom 7**. Mount `SurfaceThemeProvider` once
> at the root (theme + reset) and put router-aware components inside a
> `BrowserRouter`. See [USAGE.md](./USAGE.md).
>
> Note: the shipped UI strings are in Portuguese (pt-BR) — the components below
> show the labels they render.

---

## Shells

The high-level building blocks. Each shell owns routing, layout, and
loading/empty/error handling so a surface author only writes tab bodies.

| Component | Purpose |
|---|---|
| `SurfaceThemeProvider` | Applies `surfaceTheme` (MUI theme from tokens) + `CssBaseline`. Mount once at the root. |
| `IntegrationAdminShell` | Instance-centric admin shell: `…/instance/:instanceId/:tabId`. |
| `TeamContextShell` | Team-centric shell: `/team/:teamId/:tabId`, resolves collaborator + default instance. |
| `InstancePicker` | Landing grid listing all instances of an integration type. |
| `surfaceTheme` | The raw MUI `Theme` object, if you need to compose or extend it. |

### `SurfaceThemeProvider`

| Prop | Type | Required | Notes |
|---|---|---|---|
| `children` | `ReactNode` | yes | Your app tree. |

```tsx
<SurfaceThemeProvider>
  <App />
</SurfaceThemeProvider>
```

### `IntegrationAdminShell`

| Prop | Type | Required | Notes |
|---|---|---|---|
| `integrationType` | `string` | yes | e.g. `"slack"`. Passed to every tab. |
| `tabs` | `TabDefinition[]` | yes | `{ id, label, component }`; `component` gets `{ instanceId, integrationType }`. |
| `basePath` | `string` | yes | Router base for deep links, e.g. `"/s/slack"`. |
| `title` | `string` | no | Header title; defaults to the instance name/id. |
| `subtitle` | `string` | no | Header subtitle; defaults to `integrationType`. |

`TabDefinition`:

```ts
interface TabDefinition {
  id: string;
  label: string;
  component: ComponentType<{ instanceId: string; integrationType: string }>;
}
```

```tsx
<IntegrationAdminShell
  integrationType="slack"
  basePath="/s/slack"
  tabs={[{ id: "overview", label: "Overview", component: OverviewTab }]}
/>
```

### `TeamContextShell`

| Prop | Type | Required | Notes |
|---|---|---|---|
| `integrationType` | `string` | yes | Used to resolve a default instance to proxy queries. |
| `tabs` | `TeamTabDefinition[]` | yes | `{ id, label, component }`; `component` gets `TeamTabProps`. |
| `basePath` | `string` | yes | Used to build `…/team/:teamId/:tabId` links, e.g. `"/"`. |
| `title` | `string` | no | Header title; defaults to the team name. |

`TeamTabProps` / `TeamTabDefinition`:

```ts
interface TeamTabProps { teamId: string; instanceId: string; integrationType: string }
interface TeamTabDefinition {
  id: string;
  label: string;
  component: ComponentType<TeamTabProps>;
}
```

```tsx
<TeamContextShell
  integrationType="github"
  basePath="/"
  tabs={[{ id: "overview", label: "Overview", component: TeamOverviewTab }]}
/>
```

### `InstancePicker`

| Prop | Type | Required | Notes |
|---|---|---|---|
| `integrationType` | `string` | yes | Filters the instance list. |
| `hrefForInstance` | `(instanceId: string) => string` | yes | Returns the deep-link path (relative to router base). |
| `title` | `string` | no | Header; defaults to `Surface <integrationType>`. |
| `subtitle` | `string` | no | Header subtitle. |

```tsx
<InstancePicker integrationType="slack" hrefForInstance={(id) => `/instance/${id}`} />
```

---

## Design-system components

Low-level primitives used by the shells and tabs. Reuse them directly in custom
tabs.

| Component | Purpose |
|---|---|
| `PageHeader` | Title + subtitle + breadcrumbs + actions slot. |
| `Tabs` / `TabPanel` | Router-driven tab bar and per-tab panel (active tab from `:tabId`). |
| `DataTable<T>` | Sortable, paginated table with column accessors. |
| `JsonViewer` | Pretty-printed read-only JSON block. |
| `LoadingState` | Centered spinner with a label. |
| `EmptyState` | Centered title/description/icon/action for empty or error states. |
| `ErrorBoundary` | Class error boundary with a fallback render prop. |
| `TimestampRelative` | Relative time (pt-BR) with an absolute tooltip. |
| `HealthBadge` | Colored chip for `healthy` / `degraded` / `down` / `unknown`. |
| `DriftBadge` | "Sincronizado" / "Drift detectado" chip from a boolean. |
| `IdentityRow` | One linked external identity row (email, ext id, status, last seen). |

### `PageHeader`

| Prop | Type | Required |
|---|---|---|
| `title` | `string` | yes |
| `subtitle` | `string` | no |
| `breadcrumb` | `BreadcrumbItem[]` (`{ label, to? }`) | no |
| `actions` | `ReactNode` | no |

```tsx
<PageHeader title="Slack" subtitle="Workspace admin" breadcrumb={[{ label: "Integrações", to: "/ops/integrations" }, { label: "slack" }]} />
```

### `Tabs` / `TabPanel`

`Tabs` reads the active tab from the `:tabId` route param and navigates on click;
`TabPanel` renders its children only when its `id` matches.

| Component | Props |
|---|---|
| `Tabs` | `items: TabDef[]` (`{ id, label }`), `basePath: string` |
| `TabPanel` | `id: string`, `children: ReactNode` |

```tsx
<Tabs items={[{ id: "a", label: "A" }]} basePath="/s/slack/instance/i1" />
<TabPanel id="a"><div>A body</div></TabPanel>
```

### `DataTable<T>`

| Prop | Type | Required | Notes |
|---|---|---|---|
| `rows` | `T[]` | yes | |
| `columns` | `ColumnDef<T>[]` | yes | `{ id, header, accessor, sortable? }` |
| `keyField` | `keyof T` | yes | Stable row key. |
| `pageSize` | `number` | no | Default `25`. |
| `emptyLabel` | `string` | no | Default `"Nenhum registro"`. |

Client-side sorting (per `sortable` column) and pagination kick in once rows
exceed the page size.

```tsx
<DataTable<{ id: string; name: string }>
  rows={rows}
  keyField="id"
  columns={[{ id: "name", header: "Name", accessor: (r) => r.name, sortable: true }]}
/>
```

### `JsonViewer`

| Prop | Type | Required |
|---|---|---|
| `value` | `unknown` | yes |

```tsx
<JsonViewer value={{ region: "sa-east-1" }} />
```

### `LoadingState`

| Prop | Type | Required | Default |
|---|---|---|---|
| `label` | `string` | no | `"Carregando…"` |
| `size` | `number` | no | `32` |

### `EmptyState`

| Prop | Type | Required |
|---|---|---|
| `title` | `string` | yes |
| `description` | `string` | no |
| `icon` | `ReactNode` | no |
| `action` | `ReactNode` | no |

```tsx
<EmptyState title="No instances" description="Create an integration_instance to start." />
```

### `ErrorBoundary`

| Prop | Type | Required | Notes |
|---|---|---|---|
| `children` | `ReactNode` | yes | |
| `fallback` | `(error: Error, reset: () => void) => ReactNode` | no | Defaults to an MUI `Alert`. |

```tsx
<ErrorBoundary fallback={(err, reset) => <button onClick={reset}>Retry: {err.message}</button>}>
  <RiskyTab />
</ErrorBoundary>
```

### `TimestampRelative`

| Prop | Type | Required |
|---|---|---|
| `isoString` | `string` | yes |

Renders e.g. `há 5 minutos` with the absolute time in a tooltip.

### `HealthBadge`

| Prop | Type | Required | Notes |
|---|---|---|---|
| `status` | `"healthy" \| "degraded" \| "down" \| "unknown"` (`HealthStatus`) | yes | Maps to a colored MUI chip. |

### `DriftBadge`

| Prop | Type | Required |
|---|---|---|
| `inSync` | `boolean` | yes |

### `IdentityRow`

| Prop | Type | Required |
|---|---|---|
| `identity` | `IdentityT` | yes |
| `action` | `ReactNode` | no |

`IdentityT`:

```ts
interface IdentityT {
  id: string;
  collaborator_email: string;
  collaborator_name?: string;
  external_id: string;
  external_metadata?: Record<string, unknown>;
  status: "active" | "soft_deleted";
  last_seen_at?: string;
}
```

---

## Pre-built tabs

Drop-in tab components for the common console-ops signals. Each takes
`{ instanceId, integrationType }` (or `TeamTabProps` for the team tab) so it fits
straight into a shell's `tabs` array. They each call the matching hook and render
a `LoadingState` / `EmptyState` as needed.

| Tab | Source data (hook) | Notes |
|---|---|---|
| `OverviewTab` | `useInstance` | Instance summary + `JsonViewer` of config (secrets masked). |
| `DriftTab` | `useDriftStatus` | `DriftBadge` + drift `DataTable`. |
| `IdentitiesTab` | `useIdentities` | List of `IdentityRow`s. |
| `ActionsTab` | `useActionCatalog` | Declared actions table. |
| `RecentRunsTab` | `useRecentRuns` | Recent workflow-run audit entries. |
| `WebhookLogTab` | `useWebhookLog` | Recent webhook audit entries (signature ✓/✗). |
| `ResourcesTab` | `useSurfaceQuery` | Generic resource list; configurable. |
| `TeamOverviewTab` | drift + identities + runs + catalog | Team health grid; expects `TeamTabProps`. |

`ResourcesTab` is the only one with extra props:

| Prop | Type | Required | Default |
|---|---|---|---|
| `instanceId` | `string` | yes | |
| `integrationType` | `string` | yes | |
| `queryName` | `string` | no | `"list-resources"` |
| `columns` | `ColumnDef<ResourceItem>[]` | no | name + kind columns |

```tsx
const tabs = [
  { id: "overview", label: "Overview", component: OverviewTab },
  { id: "drift", label: "Drift", component: DriftTab },
  { id: "resources", label: "Resources", component: ResourcesTab },
];
```

---

## Icons

### `IntegrationIcon`

A minimal initial-based glyph colored from the `brand` token table (falls back to
a neutral slate for unknown names).

| Prop | Type | Required | Default |
|---|---|---|---|
| `name` | `string` | yes | — (drives color + initial) |
| `size` | `number` | no | `24` |
| `data-testid` | `string` | no | — |

```tsx
<IntegrationIcon name="slack" size={32} />
```

---

## Design tokens

Exported as plain objects you can read in any component. The root `tokens` object
bundles all four.

| Export | Shape |
|---|---|
| `colors` | `{ text, background, semantic, divider }` (hex values). |
| `spacing` | `{ xs:4, sm:8, md:16, lg:24, xl:32, "2xl":48, "3xl":64 }` (px). |
| `typography` | `{ fontFamily, heading: {h1..h4}, body, caption, mono }`. |
| `brand` | per-integration `{ primary, onPrimary }` palette; key type `BrandKey`. |
| `tokens` | `{ colors, spacing, typography, brand }` (type `Tokens`). |

```ts
import { tokens, spacing } from "@dakasa-yggdrasil/surface-toolkit";
const gutter = spacing.lg;             // 24
const ink = tokens.colors.text.primary; // "#0F172A"
```

`brand` ships palettes for: `slack`, `github`, `grafana`, `google-workspace`,
`kubernetes`, `aws`, `secrets-management`, `webhooks-external`.

---

## See also

- [USAGE.md](./USAGE.md) — wiring a surface end-to-end.
- [HOOKS.md](./HOOKS.md) — the data hooks behind these components.
</content>

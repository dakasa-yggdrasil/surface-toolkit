# Development

How to build, test, and publish `@dakasa-yggdrasil/surface-toolkit`. This is a
**published React/TS library** (not a deployable surface), so the loop is the
standard npm-library one: lint → test → build → publish on tag.

> Read the [README](../README.md) for what the package is and
> [SURFACE_CONTRACT](https://github.com/dakasa-yggdrasil/surface-conformance)
> for the invariants the toolkit primitives are built to protect.

---

## Prerequisites

- **Node 20** (matches CI).
- npm (the repo ships a `package-lock.json`; use `npm ci` for reproducible installs).

---

## Setup

```bash
npm ci
```

Peer dependencies (`react`, `react-dom`, `react-router-dom`,
`@tanstack/react-query`, `@mui/material`, `@emotion/*`) are listed under both
`peerDependencies` and `devDependencies`, so a plain `npm ci` gives you a working
test/build environment.

---

## Commands

| Command | What it does |
|---|---|
| `npm run lint` | `tsc --noEmit` — type-check only, no emit. |
| `npm test` | `vitest run` — single pass (jsdom + Testing Library). |
| `npm run test:watch` | `vitest` — watch mode. |
| `npm run build` | `vite build` (ES + CJS lib bundles) then `tsc --emitDeclarationOnly` for `.d.ts`. |

CI runs `npm run lint && npm test && npm run build` on every push/PR to `main`
(`.github/workflows/ci.yml`) and uploads `dist/` as an artifact.

---

## Repo layout

```
src/
  index.ts            # root barrel: re-exports tokens, icons, components, hooks, tabs, shell
  tokens/             # colors, spacing, typography, brand → tokens
  icons/              # IntegrationIcon
  components/         # design-system primitives (PageHeader, DataTable, badges, states, …)
  hooks/              # React Query data hooks (useYggdrasilAPI + the rest)
  tabs/               # pre-built tab bodies (OverviewTab, DriftTab, …)
  shell/              # IntegrationAdminShell, TeamContextShell, InstancePicker, SurfaceThemeProvider
  test-setup.ts       # @testing-library/jest-dom matchers
vite.config.ts        # library build (lib mode, externalizes peer deps)
vitest.config.ts      # test config (jsdom, globals)
tsconfig.json
```

Each subdirectory has an `index.ts` barrel; `src/index.ts` re-exports all of
them, so everything is importable from the package root.

---

## Tests

- Vitest + `@testing-library/react` under jsdom (`vitest.config.ts`).
- Co-located `*.test.ts(x)` files next to the source.
- Network is mocked at `globalThis.fetch` (see `src/hooks/*.test.ts`).

```bash
npm test                       # all
npx vitest run src/components   # one directory
npx vitest run -t "DataTable"   # by test name
```

> Note: `src/shell/IntegrationAdminShell.test.tsx` is currently `describe.skip`'d
> with a `TODO V2` — the shell now embeds tabs that fetch from `/manifests` +
> `/ops`, and the single `fetch` mock there returns stale shapes. Re-enable it
> alongside refreshing the hook mocks.

---

## Build output

`vite build` (lib mode) emits to `dist/`:

| File | From `package.json` |
|---|---|
| `dist/index.js` | `module` / `exports["."].import` (ESM) |
| `dist/index.cjs` | `main` / `exports["."].require` (CJS) |
| `dist/index.d.ts` | `types` (from `tsc --emitDeclarationOnly`) |
| `*.map` | sourcemaps (enabled in `vite.config.ts`) |

Peer deps (`react`, `react-dom`, `react/jsx-runtime`, `react-router-dom`,
`@tanstack/react-query`, `@mui/material`, `@emotion/react`, `@emotion/styled`)
are externalized, so the bundle ships none of them.

> **Known drift / TODO:** `package.json` declares an `exports["./styles"]` →
> `./dist/styles.css` entry, but there is no CSS source in `src/` and the Vite
> build does not emit `styles.css`. Importing `@dakasa-yggdrasil/surface-toolkit/styles`
> will fail today. Either add a stylesheet to the build or drop the subpath — the
> theme/tokens currently cover styling without a CSS file.

The published tarball contains only `dist`, `README.md`, and `LICENSE`
(`package.json#files`).

---

## Publishing

Releases go to **GitHub Packages** (not the public npmjs registry).

- **Registry:** `https://npm.pkg.github.com`, scope `@dakasa-yggdrasil`.
- **Trigger:** pushing a tag matching `v*` runs `.github/workflows/publish.yml`,
  which does `npm ci && npm test && npm run build && npm publish` with
  `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` (needs `packages: write`).
- `publishConfig.access` is `public`.

Release flow:

```bash
# 1. bump the version in package.json (current: 0.2.0), commit it
# 2. tag and push
git tag v0.2.1
git push origin v0.2.1
```

CI handles the actual `npm publish` — do not publish from a laptop.

To install the published package, consumers must scope the registry:

```bash
# consumer .npmrc
@dakasa-yggdrasil:registry=https://npm.pkg.github.com
```

---

## Conformance

`.github/workflows/surface-conformance.yml` runs the shared
`dakasa-yggdrasil/surface-conformance` reusable workflow against this repo on
push/PR. The toolkit isn't a surface, but it ships the canonical shells/hooks
every surface uses to satisfy the `SURFACE_CONTRACT` §3 invariants
(session-delegated auth, backend-agnostic, multi-tenant aware, federated
deployable), so the same lint guards against a primitive accidentally breaking
them.

---

## See also

- [USAGE.md](./USAGE.md) · [COMPONENTS.md](./COMPONENTS.md) · [HOOKS.md](./HOOKS.md)
- [yggdrasil-core](https://github.com/dakasa-yggdrasil/yggdrasil-core) — the control plane the hooks talk to.
</content>

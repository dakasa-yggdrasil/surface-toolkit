# Repo Context

Use this context whenever working in the Yggdrasil surface template (or in any surface cloned from it).

## ⚠️ READ FIRST: `SURFACE_CONTRACT.md`

Surface is a **slime**: shape-free (UI / API / MCP / bot / dashboard / wizard / anything), invariants-bound. The canonical contract lives at `SURFACE_CONTRACT.md` in the repo root.

## ABSOLUTE rule #0 — Yggdrasil scope vs Backend scope

Yggdrasil (and surfaces) = IDP for the operating COMPANY's internal team. Backend = end-user-facing business. A surface views/dispatches operations on COMPANY-OWNED resources for the INTERNAL team. Never an end-user product frontend.

Example: "Stripe webhook health dashboard for platform team" = Yggdrasil surface. "Pay your bill" page for customers = NOT Yggdrasil. Heuristic: audience is COMPANY's internal team → Yggdrasil surface; audience is END-USERS → not Yggdrasil.

## Invariants every surface honors

- **Stateless w.r.t. business** — surface owns no business state. If absolutely needed, ADR + sign-off path documented in §5.1.
- **Auth via Yggdrasil session** — delegated. Public surfaces use read-only Yggdrasil tokens.
- **Backend-agnostic** — calls Yggdrasil core `/api/v1/*`. Direct provider API bypass strongly discouraged; ADR if absolutely needed (§5.2).
- **Multi-tenant aware** — `integration_instance` scoping respected.
- **Lego principle** — no hardcoded cloud / CDN / auth / analytics / i18n provider.
- **No business decisions** — surface presents and dispatches; doesn't decide business rules.

## Hard line (no exceptions)

- NEVER log credentials, secrets, signing keys, tokens.
- NEVER reimplement user auth from scratch.
- NEVER hardcode cloud / CDN / hosting / auth provider.
- NEVER make business decisions.

## Freedoms (slime adapts)

- Any framework, any shape, any real-time mechanism.
- UX-edge persistence (localStorage, IndexedDB) for non-business state.
- Custom data shaping, aggregations, cross-integration views.
- New surface "shapes" don't need permission — only the invariants do.

## Default workflow

1. Read `SURFACE_CONTRACT.md` if not already in session.
2. Keep the template generic; defaults production-friendly.
3. Update docs, manifest, Dockerfile, and Taskfile together.
4. Run `YGGDRASIL_WORKSPACE_ROOT=/path/to/yggdrasil task test`.
5. Before opening a PR, walk the self-test in `SURFACE_CONTRACT.md` §8.

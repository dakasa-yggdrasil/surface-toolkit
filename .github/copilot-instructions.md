# GitHub Copilot — Yggdrasil surface repository

READ FIRST: `SURFACE_CONTRACT.md` in the repo root. Surface is modeled as a **slime** — shape-free (UI / API / MCP / bot / dashboard / wizard / anything), invariants-bound.

## ABSOLUTE rule #0 — Yggdrasil scope vs Backend scope

Yggdrasil (and surfaces) = IDP for the operating COMPANY's own internal team (collaborators, devops, platform engineers). Backend services = end-user-facing business (customers, consumers).

A surface views/dispatches COMPANY-OWNED resources for the INTERNAL team — never an end-user product frontend.

Example: "Stripe webhook health dashboard for platform team" → Yggdrasil surface. "Pay your bill page for customers" → operator product frontend (NOT Yggdrasil surface, even if it dispatches a workflow somewhere). Heuristic: audience is COMPANY internal team → Yggdrasil surface; audience is END-USERS → not Yggdrasil.

When suggesting a new surface feature, ALWAYS first determine the audience. Suggesting that a customer-facing checkout page be implemented as a surface is wrong (that's the product frontend). Suggesting that an internal admin dashboard for managing the company's Stripe webhook URLs be implemented as a separate backend is wrong (that's a surface).

## Invariants every suggestion must honor

- **Stateless w.r.t. business** — don't suggest a surface-owned DB / KV / file persistence for business state. Strongly discouraged with documented exception path (§5.1).
- **Auth via Yggdrasil session** — never suggest reimplementing OIDC/SAML/your-own-login. Always delegate to Yggdrasil session.
- **Backend-agnostic** — suggest calls to Yggdrasil core `/api/v1/*`, NOT direct calls to provider APIs (Stripe/AWS/GitHub/EFI). Direct provider bypass strongly discouraged with documented exception path (§5.2).
- **Multi-tenant aware** — every data call respects `integration_instance` scoping.
- **Lego principle** — NEVER hardcode a specific cloud / CDN / hosting / analytics / i18n / auth provider.
- **No business decisions** — surface presents + dispatches; never decides business rules.

## Hard line (no exceptions — reject suggestion if it violates)

- NEVER suggest logging credentials, secrets, tokens, signing keys, refresh tokens.
- NEVER suggest implementing user auth from scratch.
- NEVER suggest hardcoded cloud / CDN / auth provider.
- NEVER suggest business decision logic (charge user, refund, grant permission).

## Freedoms (slime adapts — suggest freely)

- Any UI framework (React, Vue, Svelte, server-rendered Go, Elixir LiveView, etc.)
- Any presentation shape (UI, API-only, MCP server, Slack bot, dashboard, wizard, hybrid)
- Any real-time mechanism (SSE, WebSocket, polling)
- UX-edge persistence (localStorage, sessionStorage, IndexedDB) for non-business UX state
- Custom data shaping, aggregations, cross-integration views
- New surface "shapes" never need permission — invariants do

## Scaffold rules

- Keep the scaffold generic and core-first.
- Preserve runtime safety defaults.
- Keep manifest, docs, Taskfile, and Dockerfile aligned.

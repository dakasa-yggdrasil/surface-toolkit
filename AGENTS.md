# AGENTS

## ⚠️ ABSOLUTE rule #0 — Yggdrasil scope vs Backend scope

Yggdrasil (and surfaces) = IDP for the operating COMPANY's own internal team. Backend services = end-user-facing business operations. A surface views/dispatches COMPANY-OWNED resources for the INTERNAL team — never an end-user product frontend.

Example: Stripe webhook health dashboard for platform team = Yggdrasil surface. "Pay your bill" page for customers = NOT Yggdrasil (operator product frontend). Heuristic: audience is COMPANY internal team → Yggdrasil surface; audience is END-USERS → not Yggdrasil.

Full rule in `SURFACE_CONTRACT.md` §0 and `integration-template/INTEGRATION_CONTRACT.md` §0.

## 🐌 READ FIRST: `SURFACE_CONTRACT.md`

Every AI assistant working in this repo (or in any surface cloned from this template) MUST read [`SURFACE_CONTRACT.md`](./SURFACE_CONTRACT.md) first. It defines surface as a **slime** — shape-free (UI / API / MCP / bot / dashboard / wizard / anything), but with strict invariants:

- Stateless w.r.t. business (business state strongly discouraged; exception path documented)
- Auth delegated to Yggdrasil session
- Backend-agnostic: calls Yggdrasil core; direct provider bypass strongly discouraged
- Multi-tenant aware
- Lego principle: no hardcoded cloud / CDN / auth provider
- No business decision authority

Hard rules (never): logging credentials, business decisions in surface, hardcoded cloud, inline credentials, reimplementing user auth from scratch.

If a planned change crosses any "strongly discouraged" or "hard line" — STOP and re-read the contract.

## Repo role
This repository is the official template for new Yggdrasil surfaces.

## Non-negotiable rules
- Keep the scaffold generic and core-first.
- Do not bake product-specific business logic into the template.
- Preserve readiness, timeouts, graceful shutdown, and clear local-dev ergonomics.
- If the template changes, keep README, manifest, Dockerfile, and Taskfile aligned.

## Commands
- `YGGDRASIL_WORKSPACE_ROOT=/path/to/yggdrasil task config`
- `YGGDRASIL_WORKSPACE_ROOT=/path/to/yggdrasil task test`
- `docker build -t surface-template:local .`

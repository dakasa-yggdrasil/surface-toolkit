# CLAUDE

## ⚠️ ABSOLUTE rule #0 — Yggdrasil scope vs Backend scope

Yggdrasil (and surfaces) is the **IDP for the operating COMPANY's own internal team** (collaborators, devops, platform engineers). Backend services run end-user-facing business operations (customers, consumers).

A surface views/dispatches COMPANY-OWNED resources for the INTERNAL team — never an end-user product frontend. Example: "Stripe webhook health dashboard for platform team" → Yggdrasil surface. "Pay your bill page for customers" → operator product frontend, NOT Yggdrasil. Audience check: COMPANY's internal team → Yggdrasil; END-USERS → not Yggdrasil.

Full table + heuristic in `SURFACE_CONTRACT.md` §0 + `integration-template/INTEGRATION_CONTRACT.md` §0.

## 🐌 READ FIRST: `SURFACE_CONTRACT.md`

Before any change in this repo or any surface cloned from it, read [`SURFACE_CONTRACT.md`](./SURFACE_CONTRACT.md). It is the canonical definition — surface modeled as a **slime**: shape is intentionally free (UI / API / MCP / bot / hybrid / dashboard / wizard / anything), but the **invariants** are the slime's skeleton:

1. Stateless w.r.t. business state (strongly discouraged with documented exception path)
2. Auth via Yggdrasil session (delegated; never reimplement)
3. Backend-agnostic (calls Yggdrasil core API; bypassing to call provider APIs directly is strongly discouraged with documented exception path)
4. Multi-tenant aware (respects `integration_instance` scoping)
5. Federated deployable (Lego principle: no hardcoded cloud / CDN / auth / analytics)
6. No business decision authority (presents + dispatches; doesn't decide business rules)

If invariants hold, the slime accepts any shape. Internal surfaces enjoy more edge freedom; published surfaces tighten up.

Then read `AGENTS.md` for scaffold-specific rules.

This repository is a template. Favor clear defaults and portability over cleverness.

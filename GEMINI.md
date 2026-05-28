# GEMINI

## ⚠️ ABSOLUTE rule #0 — Yggdrasil scope vs Backend scope

Yggdrasil (and surfaces) = IDP for the operating company's internal team. Backend = end-user-facing business. A surface = view/dispatch on COMPANY-OWNED resources for the INTERNAL team. Never an end-user product frontend. Example: "Stripe webhook health for platform team" → Yggdrasil. "Pay your bill" for customers → NOT Yggdrasil.

Full rule in `SURFACE_CONTRACT.md` §0.

## 🐌 READ FIRST: `SURFACE_CONTRACT.md`

Surface is modeled as a **slime** — shape adapts to need (UI / API / MCP / bot / hybrid / dashboard / wizard / anything). What makes it a Yggdrasil surface are the **invariants**, not the form: backend-agnostic (calls Yggdrasil core, never bypasses to provider APIs except via documented exception path), auth via Yggdrasil session, stateless w.r.t. business, multi-tenant aware, Lego principle (no hardcoded cloud/CDN/auth), no business decision authority.

If you find yourself wanting business state in surface DB, or calling Stripe/AWS/GitHub directly — STOP and re-read §5 (strongly discouraged with exception path) or §6 (hard line).

Then read `AGENTS.md`.

Focus on template quality, portability, and core-first defaults.

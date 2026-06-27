# Yggdrasil Surface Family — Scope & Build Plan

> **O que é.** A decisão de escopo das 9 surfaces de operador do Yggdrasil
> (AWS · K8s · Slack · Google Workspace · Grafana · Prometheus · EFI · Stripe · AI),
> todas reusando o design da surface do GitHub. Ancorado nos adapters reais
> (levantamento `surface-scoping`, 2026-06-27). Companheiro do playbook de craft
> (`integration-github/docs/superpowers/specs/2026-06-27-surface-screen-craft-playbook.md`).

## Princípios (travados com o Giovanni)

1. **Decoplar / LEGO acima de tudo.** Os `integration-*` são públicos (a comunidade
   consome). Cada surface é **standalone, 1:1 com seu integration**, publicável de forma
   independente. **A integration é o CORAÇÃO da surface — indivisível**: não se fatia
   surface por *feature*, só por *integration*. **Sem fusão** de surfaces (Grafana≠Prometheus,
   EFI≠Stripe). Fusão só se os *integrations* se unirem — e mesmo aí não recomendado.
2. **Toolkit pra a COMUNIDADE, não esqueleto rígido.** Padrões recorrentes viram
   **primitivos reusáveis** que cada surface compõe — não uma base baked-in que acopla.
   Objetivo: deixar o toolkit um acelerador bom o bastante pra qualquer um criar surface rápido.
3. **Visualização TÉCNICA/quantitativa**, não editorial. Audiência = operador/SRE → pulso e
   pilares foregroundam **números concretos** (webhooks ativos, contas, targets up, réplicas
   ready, eventos/24h, falhas de assinatura, saldo, próximo payout). Densidade de KPI, mantendo
   a pele Atelier + a estrutura de pulso.
4. **Regra #0 (SURFACE_CONTRACT §0):** toda surface é a visão/controle do **time interno**
   sobre infra **da empresa** — nunca um frontend de produto pro usuário final. Apresenta +
   despacha; não decide regra de negócio. Chama o core, nunca o provider direto.

## Fato dominante do levantamento

Em quase todo adapter o **DISPATCH já está pronto hoje, mas o OBSERVE é o buraco**: cada um
tem só 1-2 `on_surface_query` ligados, embora a lógica `observe_*` já exista como Execute. O
grosso do trabalho da família é **read-wiring mecânico** (embrulhar `observe_*` como
`on_surface_query`) + **um endpoint de histórico/auditoria no core** (várias surfaces mostram
`emptyRows()` só porque esse read não existe). Construir esse alicerce **uma vez** acende as 9.

## Fundação compartilhada do toolkit (construir PRIMEIRO — não é surface)

Primitivos que toda surface compõe (extraídos da surface do GitHub + deste levantamento):

- **Shell de pulso**: headline técnico de uma-linha + faixa "precisa de você" (eufemizada,
  nunca "ALERTA") + uma sparkline de sinal + prévias calmas por-pilar.
- **`KpiStrip`**: tiles densos (label/valor/delta + sparkline opcional + tom de status) — o
  miolo técnico de toda surface de infra.
- **Tier model capability-aware** (membro=read-only / líder=dispatch reversível /
  admin=alto-blast-radius); authz server-side autoritativo, tier = cortesia de UX (§3.6).
  Componente de gating + padrão "botão desabilitado + dica de permissão".
- **Configure form** com redação de segredo (mostra presença/saúde, nunca valores; segredos
  materializados pelo core) + badge de presença-de-credencial.
- **`on_surface_query` read-wrapper SDK** padrão (embrulha `observe_*` como read endpoint).
- **Endpoint de histórico/auditoria no core** (run-history por instância; mata `emptyRows()`).
- **Nudge-emit + nudge-audit** (channel-agnostic, capability-gated líder/admin, rate-limited,
  auditável, via core → integration-slack).
- **`↗` deep-link** pro tool nativo (escape hatch "nenhum valor de cliente embutido").
- **Componentes transversais**: detector de **identity-drift** (um colaborador sem match ativo),
  **drift-render** (desejado-vs-vivo), **cluster-validation-gate** (E2E-green + no-CI-broken),
  **FinOps-signal** (usage-vs-requests / savings).

## Escopo por surface

> Por surface: pilares (o que gerencia) · prontidão do adapter · guarda da Regra #0 · tiers.

### 1. Kubernetes — `integration-kubernetes` (🟢 mais maduro)
- **Pilares:** Workloads & Pods · Rollouts & Releases · Wake/Sleep & Capacidade · Guardrails & Higiene.
- **Adapter:** v1.13.0, 16 execute ops + 2 surface-queries (list-workloads, cluster-info) já
  ligados, surface-ui declara as tabs. Gap #1: `GET /pods` morto → list-pods com flags de
  pod_health (CrashLoop/ImagePull). Wake-state e drift são needs-work.
- **Risco #0:** infra-op (restart/rightsize/repoint/scale) é permitido; business-op (refund/charge)
  nunca aqui. Flag visual "infra sensível" em payments/EFI/temporal antes de restart.
- **Tiers:** membro=read+dry-run · líder=image/resources/rollout/apply · admin=destroy_*/declarative-apply-prune/wake-sleep/configure (gate obrigatório).

### 2. AWS — `integration-aws` (🟡 ~100 ops, observe fino)
- **Pilares:** Cluster & Compute (wake/sleep) · Data-tier (RDS/ElastiCache) · Registry/DNS/Secrets · Custo (FinOps) · Segurança & Acesso (SSO).
- **Adapter:** v1.30.0. Dispatch riquíssimo hoje (todo ensure_/destroy_ + catálogo de custo +
  segurança + Identity Center). Observe = só list-ecr-images + list-accounts → faltam ~5-8
  `on_surface_query` (cluster/nodegroup/RDS/cache/cost-summary/security-baseline).
- **Risco #0:** Custo = **FinOps da conta da empresa**, murado do dinheiro-de-cliente (Stripe/EFI/
  pró-labore). S3 = lifecycle/policy/public-access, nunca conteúdo.
- **Tiers:** membro=read · líder=remediação de custo + baseline-tighten + rightsize · admin=wake/sleep/deep-sleep + IAM/IRSA/Secrets + Identity-Center (gate obrigatório em destroy/deep-sleep).

### 3. Slack — `integration-slack` (🟢 31 ops, surface existe)
- **Pilares:** Membros & Lifecycle · Canais & User-Groups · **Trilha de Nudge** · Acesso & SSO · (Presença, opcional).
- **Adapter:** v2.6.0. Dispatch maduro. Observe = só list-channels ligado → faltam members+MFA,
  user-groups, sent-audit. **Canvas NÃO existe** no adapter → fora do v1. Surface-ui é o shell
  team-context antigo → reskin pro design fixo.
- **Risco #0:** `post_message` só conteúdo operacional/nudge em canais gerenciados (sem composer
  livre, sem DM-cliente). **Guard sócios:** nunca auto-desativar um sócio.
- **Tiers:** membro=read · líder=canais/grupos do seu time + re-enviar nudge · admin=invite/deactivate/SCIM/SAML/configure.

### 4. Google Workspace — `integration-google-workspace` (🟢 maduro, surface existe)
- **Pilares:** People & Directory · Acesso & Grupos · SSO & Sign-in · Lifecycle (onboard/offboard) · Re-sync & Reconciliação.
- **Adapter:** v2.5.0. ensure_user/observe_users/destroy_user/saml/groups/mailbox/calendar +
  reactors de lifecycle. Gaps: sem observe-grupos/OUs (só per-user), MFA tem permissão mas sem
  capability, session-terminate é reactor-only.
- **Risco #0 / seam:** **GW = identidade/acesso/SSO/sessões**; **employment-clt = contrato/folha**.
  Sem valores de payroll aqui.
- **Tiers:** membro=read (default "eu") · líder=grupos/mailbox/OU/suspend do seu time + re-sync · admin=destroy_user/SSO/security/configure.

### 5. Grafana — `integration-grafana` (🟡 2 reads, alertas vazio)
- **Pilares:** Painéis & Pastas · Conexões (datasources) · Alertas & Roteamento · Acesso (users/teams/SSO) · Instância (deploy).
- **Adapter:** ~v2.7.0, ~22 caps. Observe = observe_users + list-dashboards + list-datasources.
  Alertas = `emptyRows()` (sem read real); `upsert_alert_rule` é aspiracional. Health de
  datasource não existe.
- **Risco #0:** console mostra **config/governança** do dashboard (título/pasta/datasource),
  **NUNCA valores de painel** — viz real é `↗` no Grafana nativo sob a auth do operador.
- **Tiers:** membro=read+↗ · líder=dashboards/folders/datasources/team do seu time · admin=destroy_folder/SSO/instalação/credenciais.

### 6. Prometheus — `integration-prometheus` (🟡 adapter read-only)
- **Pilares:** Query & Threshold · Saúde de Scrape-target · Alert & Rule Governance · FinOps & Heimdall · Instância & Config.
- **Adapter:** v1.2.0, 5 execute ops read-only (scrape/promql/threshold). **Zero** `/api/v1/{targets,rules,alerts}`
  → o pilar Alert/Rule é needs-work (deep-link-only no v1). recent-queries = `emptyRows()`.
- **Risco #0:** toda métrica é **telemetria de saúde/SLO pro operador** — explicitamente NÃO a
  visão de billing/analytics do cliente. Cross-link pro Grafana pra viz.
- **Par "Observabilidade"** com Grafana (mesmo trem de release, read-path de alertas compartilhado).

### 7. Stripe — `integration-stripe` (🟡 adapter+/metrics ricos, SEM surface dir)
- **Pilares:** Webhook Health · Saldo & Payouts · Disputas & Chargebacks · Reconciliação & Refunds.
- **Adapter:** v2.4.0, 19 ops + 11 séries Prometheus (signature-failures, received, dedup,
  rta-emit-errors, api-key-valid…). **Sem `surface/` dir** → scaffolding do template payment-rail.
  Sem `on_surface_query`. Disputas reconstruídas do log RTA (needs-work).
- **Risco #0:** é o **exemplo canônico** do contrato. `payment_intent/subscription/customer`
  ensure-destroy ficam FORA da surface. Money-movement (refund/payout) só admin, idempotente,
  enquadrado como remediação-de-ops. Dado de cliente só como ref opaca. Evidência de disputa =
  `↗` nativo.
- **Tiers:** membro=read+verify-signature · líder=config de webhook + nudges · admin=create_refund/create_payout/connect.

### 8. EFI (Pix) — `integration-efi` (🔴 sem surface + sem surface-query)
- **Pilares:** Webhook & mTLS · Charges & Reconciliação · Payouts & Prolabore · Refunds & Chargebacks · Instância & Credencial.
- **Adapter:** v2.4.0, 12 ops + reconcile. **Sem `surface/` dir** + `observe_*` são Execute-only
  (sem `on_surface_query`) → o maior trabalho-prerequisito. Killer feature = **drift de
  reconciliação** (EFI charges vs `identities.webhook_event_efi`) → join cross-system (provável
  read novo no core). Telemetria: só 2 métricas.
- **Risco #0 MÁXIMO:** é o exemplo *proibido* do contrato ("Pague sua conta"). Surface NUNCA
  decide quem/quanto pagar — valor+destino sempre vêm do **cash-loop workflow**; surface =
  confirm+observe. create_payout = admin, IntermediateIrreversible, duplo-confirm. **Badge de
  ambiente** (homolog vs prod) + recusar money-movement em homolog. **Seam pró-labore:** CLT
  decide competência/valor, EFI executa o Pix.
- Mesmo **template payment-rail** que o Stripe (instanciar 2×, guard de money-movement compartilhado).

### 9. AI — `integration-ai-guardian` + `integration-ai-runtime` (🔴 meta, maioria needs-work)
- **Pilares:** Frota & Ciclos (Heimdalls) · Heal & Aprovações · **Núcleo (Knowledge & Ask)** · Odin (Maestro) · **Lente Pessoas** (Heimdall[pessoas]).
- **Adapter:** ai-guardian v0.1.0 (~35 ops, núcleo KB sem LLM, gate por-construção, apply
  shadow-default) + ai-runtime (ollama/whisper, sem surface). Núcleo /ask = "today"; o resto
  (cycles live-data, fila de aprovação, Odin, people-lens) = needs-work.
- **É a META surface** — observa as 8 que observam os sistemas. Última a construir (depende das
  8 emitirem dados). Visualização mais densa da família (gráficos caprichados).
- **Risco #0:** a **Lente-Pessoas** é a mais sensível (HR-governance, IdP-bounded, observe/propõe-
  não-decide, reward aditivo, integridade read-not-expose). **Fica NESTA surface** (vive no
  ai-guardian — indivisível), líder-gated + privada, nunca broadcast.
- **Tiers:** membro=read + /ask · líder=aprovar/rejeitar + reward + people-lens do seu time · admin=kill-switch/configure/autonomy/deploy-runtime/Odin.

## Ordem de construção (por prontidão real)

0. **Fundação do toolkit** (acima) — alavancagem 9×.
1. **K8s** (adapter mais pronto; prova o shell no substrato mais maduro; 1º item: list-pods).
2. **AWS** (dispatch rico; ligar ~5-8 reads; compartilha wake-state + gate com K8s).
3. **Slack** (dona da espinha de nudge — cedo porque é dependência cross-família).
4. **Google Workspace** (mais read-wiring; assenta a seam com employment-clt).
5. **Grafana + Prometheus** (par Observabilidade, juntos; read-path de alertas compartilhado).
6. **Stripe** (scaffolding do template payment-rail; webhook-health é "today").
7. **EFI** (mesmo template; reconciliação cross-system; risco #0 máx → depois do guard provado).
8. **AI** (por último, meta; people-lens é decisão gated à parte).

## Costuras cross-surface (decisão "quem ESCREVE", não fusão)
- **SSO / Identity-Center:** um dono canônico (auth ou GW), o resto espelha read-only.
- **Pró-labore:** CLT decide competência/valor; EFI só executa o Pix.
- **GW vs employment-clt:** GW = identidade/acesso/SSO/sessões; CLT = contrato/folha.
- **Canal de nudge do Slack:** config no core; Slack observa.
- **Guard sócios (transversal):** os 4 sócios são pró-labore/equity, NÃO CLT — reactors de
  lifecycle (Slack deactivate, GW offboard) precisam de guard "nunca auto-desativar um sócio".

## Gate (recomendação: BLOQUEAR, não avisar)
Qualquer dispatch destrutivo / deep-sleep / que toca o cluster (AWS ou K8s) **bloqueia** o botão
até o gate E2E-green + no-CI-broken estar verde (CLAUDE.md do workspace). Para dispatch reversível
de baixo blast-radius (rollout-restart, release de EIP), confirm + observe pós-dispatch basta.

## Levers de v1-enxuto (pra entregar mais cedo)
Dropar canvas do Slack · alertas de Grafana/Prometheus como deep-link-only primeiro · AWS só com
ECR+accounts+audits-on-demand · AI só com a fatia do núcleo /ask.

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

## Reflexão humana — o que é precioso UNIFICAR (por integration)

> **Prática (registrar ao construir cada surface):** antes de cravar os recursos, perguntar
> *quem consome essa surface, e que informação é mais preciosa ter **unificada** — a unificação
> que o tool nativo não dá?* A surface não é um espelho do console nativo; é o **roll-up** que
> economiza os saltos manuais. Cada surface ganha sua reflexão aqui ao ser construída.

### K8s — reflexão (construindo 1º)
**Quem consome:** devops/SRE/plataforma, muitas vezes de plantão, abrindo a tela pra responder
UMA pergunta: *"está tudo de pé, e o que travou?"*. Hoje isso é `kubectl get deploy -A` + apertar
os olhos, saltando namespace por namespace, em dois clusters fisicamente separados (Domain/CP).

**O que é precioso unificar (o que o `kubectl` não dá de graça):**
1. **Ready/desired de TODO workload, cross-namespace e cross-cluster, num lugar** — o roll-up que
   substitui o "olhar 38 deployments um a um".
2. **O que travou + POR QUÊ, na hora** — pods em CrashLoop/ImagePull já correlacionados ao deployment
   e ao motivo (o adapter já detecta o estado terminal em `pod_health`); triagem, não caça.
3. **Rollouts em voo: convergindo ou empacado?** — observedGeneration/ready/updated, com o sinal
   fail-loud de `image_overrides_applied=0` (repoint que não casou nada).
4. **Estado de wake/sleep + capacidade**, pra ninguém deployar contra um cluster deep-slept.
5. **Gaps de guardrail ANTES do movimento arriscado** — PDB faltando, PVC órfão — surfaçados como
   um relatório permanente, não descobertos no incidente.

**Páginas de detalhe (do que isso decorre):** Workloads (tabela filtrável: ready/desired, SHA da
imagem, restarts, idade) · Rollouts (em-voo + recentes, convergência) · Pods/Triagem (estados
terminais com o porquê) · Guardrails (relatório PDB/PVC). Home = o pulso técnico ("38 workloads ·
36/38 ready · 2 em rollout · 1 precisa de você").

### AWS — reflexão (construindo 2º)
**Quem consome:** plataforma/devops/FinOps. A tela responde *"o que a conta está fazendo, quanto
custa, e está segura?"*. Hoje é saltar o console por serviço (EKS, RDS, Cost Explorer em us-east-1,
Security Hub, IAM) e por região (ECR us-east-1 vs workloads sa-east-1) — silos.

**O que é precioso unificar (o que o console siloado não dá):**
1. **Postura de wake/sleep + custo num pulso só** — a alavanca de hibernação da DaKasa: *o cluster
   está acordado? quanto está custando AGORA?* (sparkline de gasto com os eventos de sleep/wake
   anotados — ver o dinheiro que a hibernação economiza).
2. **Drift do baseline de segurança como pass/fail permanente** — não enterrado no Security Hub:
   GuardDuty/Inspector ligados? bucket virou público? chave IAM &gt;90d? KMS sem rotação?
3. **Liveness do data-tier** — os 3 RDS (shared/payments/temporal) + cache, up/down, num lugar.
4. **Recomendações de custo com $ acionável** — snapshots órfãos, NAT idle, EIP solta — com o
   valor e o apply seguro.
5. **Acesso/SSO pendente** (Identity Center) — quem espera permission-set.

**Páginas de detalhe:** Cluster & Compute (nodegroups, wake-state) · Data-tier (RDS/cache) · Custo
(recomendações + savings) · Segurança & Acesso (baseline + SSO) · Registry/DNS/Secrets. Home = o
pulso ("eks-prod-wake acordado · data-tier 3/3 · gasto MTD ~$X · 2 drifts de segurança · 4 economias").

### Slack — reflexão (construindo 3º)
**Quem consome:** plataforma/ops (+ RH-leve pra membership). Pergunta: *"o workspace está
saudável, e a trilha de nudge — que as OUTRAS 8 surfaces dependem — está viva?"*. Hoje o admin do
Slack é por-tela (membros, canais, SCIM), sem uma visão operacional única.

**O que é precioso unificar:**
1. **Saúde da trilha de nudge** — o backbone que TODA a família usa: entregas ok vs falhas
   (`channel_not_found` etc.). Se isso degrada, as 9 surfaces ficam mudas. É o sinal #1.
2. **Gaps de MFA** — quem não habilitou 2FA (segurança do time), exige admin xoxp- token.
3. **Drift de canais/grupos vs times** — canais/@grupos cujo time dono foi deletado/renomeado
   (órfãos), ou @grupo divergindo dos membros do time.
4. **Stragglers de offboard** — desligado no Yggdrasil mas ainda ativo no Slack (+ guard sócios:
   nunca auto-desativar um sócio).

**Páginas:** Membros & Lifecycle (roster + MFA) · Canais & Grupos (drift) · Trilha de Nudge
(entregas) · Acesso & SSO (SCIM/SAML). Home = "Workspace · 14 membros · 1 sem MFA · 3 canais
órfãos · nudge-rail ok". (Canvas fora do v1 — sem capability no adapter.)

### Google Workspace — reflexão (construindo 4º)
**Quem consome:** plataforma + RH-ops. Pergunta: *"a identidade/acesso de todos está correta, e o
onboard/offboard aterrissou?"*. Hoje é o admin.google.com por-tela (usuários, grupos, OUs, SSO).

**O que é precioso unificar:**
1. **Drift de identidade** — diretório ≠ Yggdrasil (suspenso aqui mas ativo no core, ou vice-versa).
   É o sinal #1 — a confiança de que a tela diz a verdade.
2. **Lifecycle aterrissou?** — onboard produziu conta+mailbox+grupo; offboard suspendeu + matou
   sessões. Ver os runs dos reactors e seu resultado.
3. **Postura de SSO** — o perfil SAML inbound apontando o Google pro IdP Yggdrasil; quais OUs/grupos
   estão atrás dele (quem pode estar fora, bypassando MFA do IdP).
4. **Saúde do re-sync cron** — última execução + quantos drifts achou.

**Seam (firme):** GW = **identidade/acesso/SSO/sessões**; employment-clt = **contrato/folha**. Sem
valores de payroll aqui. **Guard sócios** (nunca auto-suspender um sócio).

**Páginas:** People & Directory (roster + OU + drift) · Acesso & Grupos · SSO & Sign-in · Lifecycle
& Re-sync. Home = "Tenant · 14 pessoas · 1 drift · SSO ok · re-sync há 8min". (observe-grupos/OUs e
MFA-enforcement = adapter gaps → needs-work honesto.)

### Grafana — reflexão (construindo 5º)
**Quem consome:** SRE/dev/plataforma. Pergunta: *"a observabilidade está saudável e governada?"*.
**Precioso unificar:** saúde dos datasources (o que o Grafana lê está no ar?); dashboards/pastas +
**dono** (pasta sem time = gap de governança); **cobertura de roteamento de alerta** (alerta sem
destino cai calado); acesso (users/teams/SSO). **NUNCA valores de painel** — só config; a viz real é
`↗` no Grafana nativo (senão um contribuidor "ajuda" embutindo um painel de receita). **Gaps honestos
(needs-work):** alert-state (emptyRows hoje), datasource-health-probe, drift managed-vs-hand-edited.
**Páginas:** Painéis & Pastas · Conexões · Alertas & Roteamento (deep-link no v1) · Acesso. Home =
"Grafana · N dashboards · M datasources · alertas via ↗".

### Prometheus — reflexão (construindo 6º)
**Quem consome:** SRE/plataforma. Pergunta: *"a telemetria está saudável, e o que ela manda agir?"*.
**Precioso unificar:** saúde de scrape-target (endpoints /metrics no ar?); atividade de
query/threshold (o que foi perguntado + violações); os sinais FinOps/Heimdall que o Prometheus já
alimenta. **Gap honesto:** `/api/v1/{targets,rules,alerts}` NÃO existe no adapter → alert/rule/firing
e a lista-de-targets-nativa são needs-work/deep-link. Toda métrica é **telemetria SLO pro operador**,
não billing do cliente. **Páginas:** Query & Threshold · Scrape Health · Alert & Rule (deep-link) ·
FinOps/Heimdall. Home = "Prometheus · K thresholds verdes · scrape ok · alertas via ↗".

### Stripe — reflexão (construindo 7º)
**Quem consome:** plataforma/finance-ops. Pergunta: *"a esteira de pagamento está saudável, e tem
algum item de dinheiro com prazo?"*. É o exemplo canônico de surface VÁLIDA do contrato.
**Precioso unificar:** integridade da ingestão de webhook (falhas de assinatura, RTA emit-erros =
eventos que não viraram workflow); saldo + payouts (dinheiro caindo na conta da EMPRESA); **disputas
com prazo** (o item mais time-sensitive); reconciliação (recebidos = RTA-emitidos). **NUNCA billing
por-cliente** — dado de cliente só como ref opaca (event_id/charge_id). Money-movement (refund/payout)
só admin, idempotente, enquadrado como remediação-de-ops (gated "Em breve" no v1 read-first).
**Gaps honestos:** disputas/payouts reconstruídos do log RTA (needs-work); sinais de /metrics
(signature-failures) precisam de passthrough do core (needs-work). v1 real = webhook-endpoints + saldo.
**Páginas:** Webhook Health · Saldo & Payouts · Disputas · Reconciliação.

### EFI (Pix) — reflexão (construindo 8º — risco #0 MÁXIMO)
**Quem consome:** plataforma/finance-ops. Pergunta: *"o trilho Pix está saudável e o livro bate?"*.
É o exemplo PROIBIDO do contrato ("Pague sua conta") → vista por construção como ops-interno.
**Precioso unificar:** saúde do webhook mTLS (o hardened no Sec#2 — última entrega, handshake);
**drift de reconciliação** (EFI charges vs `identities.webhook_event_efi` — o killer, precisa de join
cross-system via core, needs-work); auditoria de payouts/prólabore (display+confirm, decisão fica no
cash-loop). **Surface NUNCA decide quem/quanto pagar** — valor+destino vêm do workflow; surface =
confirm+observe. **Badge de ambiente** (homolog vs prod) + recusar money-movement em homolog. **Seam
prólabore:** CLT decide competência/valor, EFI executa Pix. Mesmo **template payment-rail** que Stripe.
**Páginas:** Webhook & mTLS · Charges & Reconciliação · Payouts & Prólabore · Refunds.

### AI (núcleo + heimdall) — reflexão (construindo 9º — a META)
**Quem consome:** plataforma (e líderes pra a lente-pessoas). Pergunta: *"os guardiões estão
vigiando, e o que aguarda minha aprovação?"*. É a surface que observa as 8 que observam os sistemas.
**Precioso unificar:** a **frota de Heimdalls** (escopos vigiados, último pulso, tendência de
cache-hit = a frota ficando mais barata); a **fila de aprovações** (o que aguarda decisão humana — o
ÚNICO que bloqueia, já que apply é shadow-default, nada age sem você); o **núcleo** (/ask + frescor da
KB, retrieval-puro com citações); **Odin** (cross-scope, dry-run MVP); a **lente-pessoas** (gated,
privada, observe/propõe-não-decide). **Viz mais densa da família** (gráficos caprichados: outcome dos
ciclos, cache-hit trend) — no mock mostro a visão cheia; ao vivo degrada honesto. **Gaps:** cycles
live-data, instância Odin, instância people-lens, approvals via integration-yggdrasil-self →
needs-work; **/ask é "today"**. **Páginas:** Frota & Ciclos · Heal & Aprovações · Núcleo (Ask) · Odin
(Maestro) · Lente Pessoas (gated). Home = "Guardiões: 2 vigiando · 1 aprovação aguarda · núcleo citando".

### Employment-CLT — reflexão (10ª surface)
**Quem consome:** RH/people-ops + financeiro (folha). Pergunta: *"a força de trabalho está em
ordem — folha em dia, eSocial conforme, férias/contratos resolvidos?"*. Adapter
`integration-employment-clt` (CLT-BR completo: funcionários/férias/holerites/contratos/eSocial/folha);
surface vive **in-repo** em `integration-employment-clt/surface-ui` (padrão família, sobe com o adapter).
**O que é precioso unificar:**
1. **eSocial pendente/falho** — compliance, o sinal #1 (atraso = multa). Eventos a submeter/retry.
2. **Folha** — preview/run da competência + **obrigações** (INSS/FGTS/IRRF due) + aviso-prévio.
3. **Férias** — pedidos aguardando aprovação + saldos (CLT art. 130).
4. **Contratos** — pendentes de assinatura; **holerites** por competência.
5. **Roster** — funcionários (ativo/desligado, tipo de contrato, admissão).
**Seam:** CLT = **contrato/folha**; GW = identidade. **Sócios = pró-labore (NÃO CLT)** — guard; o
pró-labore liga no cash-loop (CLT decide competência/valor → EFI executa Pix), hoje **não no adapter**
→ honest needs-work. **PII/dados sensíveis**: visão INTERNA do RH sobre os PRÓPRIOS funcionários
(rule #0 ok), mas tratar salário/CPF com cuidado.
**Páginas (operador):** Funcionários · Férias · Holerites · Contratos · **eSocial** · Folha. Home = "Folha · N
funcionários · competência <X> em preview · 2 eSocial pendentes · 1 férias aguarda".

**⭐ DUAL-AUDIENCE — a CLT é a ÚNICA surface da família com DOIS públicos** (insight 2026-06-27).
AWS/K8s/Grafana têm um único operador; a CLT tem o **RH** (vê a folha inteira) E **cada colaborador
sobre si mesmo** (minhas férias/holerites/contrato/eSocial). Pela rule #0 isso ainda é tooling INTERNO
(funcionário vendo o próprio dado de RH, não produto pra cliente). Logo a surface é **tier-aware**, ramo
no root por `scope.tier`:
- **member** → **"Meu RH"** (self-view): saldo de férias, meus holerites (Baixar PDF via `pdfUrl`), meu
  contrato, meu eSocial. Rotas `/me/*`. NUNCA vê roster/folha alheia.
- **lead** → Meu RH **+ "Férias do time"** (aprovar), escopado ao **departamento** do líder
  (`cost_center` — aproximação v1 de "time"; falta endpoint de team-members do core → upgrade depois).
- **admin/RH** (perms `clt.*`) → o cockpit operador completo.
**Ações = redirect, nunca botão morto:** pedir férias / assinar / aprovar / retry / rodar-folha →
`↗` pro **console do Yggdrasil** (`/ops/integrations?integration=employment-clt&action=…&instance=…`,
override `VITE_CONSOLE_URL`, degrada pra nota muda); baixar holerite → `pdfUrl` real. O read-first segue:
a surface não muta, só **encaminha pra ferramenta adequada**.
**Adapter (caller-scoped):** queries `my-employment/my-vacations/my-paystubs/my-contract/my-esocial` +
`team-vacations`, resolvendo o vínculo via `GetActiveEmploymentByCollaborator(collaborator_id)`; sócio
sem vínculo CLT → empty honesto ("sem vínculo CLT"). **🔴 CAVEAT DE SEGURANÇA:** o dispatcher de
surface-query NÃO recebe a identidade autenticada (o core valida sessão mas não encaminha o caller
verificado) → `collaborator_id` é do cliente e **SPOOFÁVEL** (insider poderia ler RH alheio). Hoje a
surface passa SÓ `scope.collaborator.id` (o próprio) e nunca um id de URL/input. **Fix correto (follow-up,
dono = yggdrasil-core/SDK):** injetar caller verificado server-side no surface-query e escopar por ele
(ponto único a trocar = `resolveCaller()`). NÃO expor o self-view em prod antes desse fix.

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

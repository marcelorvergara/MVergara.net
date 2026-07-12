# CLAUDE.md — mvergara.net

## Project overview

Personal portfolio for Marcelo Vergara at `mvergara.net`. Mission Control aesthetic —
dark theme, monospace accents, live service status. Built with **Angular 21 SSG**,
deployed on **Cloudflare Pages** via GitHub auto-deploy on `main`.

## Dev commands

```bash
npm start          # ng serve → localhost:4200
npm run build      # ng build --configuration production
npm run build:ssr  # SSG pre-render check (outputs static HTML to dist/)
```

Output directory for Cloudflare Pages: `dist/mvergara-net/browser`

## Architecture

- **Framework**: Angular 21, standalone components, Signals API, `@for`/`@if` control flow
- **Rendering**: Static Site Generation (`outputMode: "static"` in angular.json) — no server runtime
- **Styles**: Bespoke SCSS only, no UI library. CSS custom properties defined in `src/styles/_tokens.scss`
- **Routing**: Single page (no routes), all content is one prerendered `index.html`

## Key files

| File | Purpose |
|------|---------|
| `src/styles/_tokens.scss` | All CSS custom properties (colours, spacing, radius, transitions) |
| `src/app/data/projects.data.ts` | Static data for all 4 project cards (hook, rationale, pipeline nodes) |
| `src/app/components/project-card/` | Card with click-to-pin overlay showing pipeline + rationale |
| `src/app/components/mission-control/` | Live status widget (StatusService + circuit breaker) |
| `src/app/components/mission-control/pipeline-health/` | Sub-panel rendering the `pipeline_health` block (Pub/Sub topic rows: queued, oldest-unacked, ack/nack, DLQ badge) |
| `src/app/components/mission-control/llm-health/` | Sub-panel rendering the `llm_health` block (per-service LLM telemetry rows: requests, latency, tokens, cost, error rate) |
| `src/app/components/mission-control/cost-health/` | Sub-panel rendering the `cost_health` block (per-project GCP billing rows: MTD net cost, previous month, BRL-formatted via `Intl.NumberFormat`) |
| `src/app/services/status.service.ts` | Fetches `/api/public/status` from Monitoring Links, 10 s timeout + 1 auto-retry + fallback + manual refresh. `STATUS_API` resolves to `http://localhost:3001/api/public/status` under `isDevMode()` and the production URL otherwise — no `src/environments/` setup exists (or is needed) for this one constant |
| `src/app/utils/format-duration.ts` | Shared seconds→human-string formatter, used by Mission Control (incident duration) and the pipeline health panel (oldest-unacked age) |

## Design tokens (from `_tokens.scss`)

**Pillar colours** (one per project, used as `var(--pillar-color)` on each card — **identity**, not status):
- `--color-pillar-security` — ENP Secure Chat (blue `#3b82f6`)
- `--color-pillar-ai` — Fábula Infantil (purple `#a855f7`)
- `--color-pillar-infra` — Monitoring Links (green `#22c55e`)
- `--color-pillar-edge` — VergaraVerse (amber `#f59e0b`)

**Status colour**: `--color-status-danger` (red `#f55b5b`) — the sole token for genuine critical/down/alarm indicators across Mission Control (service dots, pipeline/LLM health critical rows, DLQ/error badges, sparkline danger states).

`--color-pillar-security` and `--color-status-danger` used to be the same token (`--color-pillar-security`, red), which meant SecureChat's name rendered alarm-red even when healthy (visible in the Cost panel: red name next to a green "healthy" dot). Split in 2026-07 — `--color-status-danger` keeps the original red value unchanged for all status/alarm usages, while `--color-pillar-security` became blue ("blue team," fits SecureChat's brand, keeps identity-token saturation consistent with purple/green/amber). `--color-pillar-infra` (green/healthy) and `--color-pillar-edge` (amber/warning) still double as both identity and status colour — that's a milder, out-of-scope version of the same overlap (green-as-identity reinforces "healthy" rather than conflicting with it).

**Surfaces**: `--color-bg` (#09090f) → `--color-surface` (#111118) → `--color-surface-2` (#1a1a25)

**Fonts**: `--font-sans` (Inter) for body, `--font-mono` (JetBrains Mono) for code/labels/badges

## Project card behaviour

- **Front**: pillar badge, project name (link), hook text, "View architecture ↗" hint
- **Overlay**: triggered by click (pins open), closed by clicking outside via `@HostListener('document:click')`
- **Pipeline**: CSS flexbox nodes (`<span class="pipeline__node">`) separated by `›` — no SVG
- The `nodes[].x` and `nodes[].y` fields in `projects.data.ts` are unused (SVG was replaced); the `edges` array is also unused
- Visit link inside overlay uses `$event.stopPropagation()` so clicking it doesn't toggle the card

## Pipeline health panel behaviour

- Renders inside the existing `.mc__frame`, below the service grid — one row per Pub/Sub topic: `url-check-tasks` (displayed as "URL Checks") and `alert-events` (displayed as "Alerts")
- Per-row stats: `queued` (backlog), `oldest` (oldest-unacked age), `ack`/`nack` counts (24h), and a `DLQ n` badge shown only when `dlq_count > 0`
- Status dot colour: healthy → `--color-pillar-infra` (green), warning → `--color-pillar-edge` (amber), critical → `--color-status-danger` (red, a dedicated status token — see [Design tokens](#design-tokens-from-_tokensscss))
- Thresholds (mirrors backend `derivePipelineStatus` in Monitoring Links' `publicStatus.service.ts` — keep both in sync if either changes):
  - `critical` if `dlq_count > 0` or `oldest_unacked_age_s > 900` (15 min)
  - `warning` if `backlog > 0`, or `nack_count_24h > 0`, or `oldest_unacked_age_s > 300` (5 min)
  - `healthy` otherwise
- When the response's `pipeline_health.source` is `"counters-fallback"` (Cloud Monitoring IAM not granted, or query failed), a small `counters only` tag renders next to the panel title — this is a degraded-but-honest state, not an error, so it never blocks rendering
- `PipelineTopic` fields are `number | null` — `null` renders as `—`; the `alert-events` topic is always `null` in fallback mode (no DB dependency in `alertservice`)

## LLM health panel behaviour

- Renders inside the existing `.mc__frame`, below the pipeline health panel — one row per LLM-backed project: `securechat` (ENP Secure Chat) and `fabula-infantil` (Fábula Infantil). Monitoring Links and VergaraVerse have no LLM in their request path, so they don't appear here.
- Per-row stats: `requests_24h`, `avg_latency_ms` (end-to-end for SecureChat's blocking `/api/chat`, TTFT for its `/api/chat/stream`), `tokens_24h` (formatted like `12.2K`), `cost_usd_24h` (formatted like `$0.05`), and an `error_rate_pct` badge shown only when `> 0`
- Status dot colour reuses the same tokens as the pipeline health panel (not project identity colours): healthy → `--color-pillar-infra` (green), warning → `--color-pillar-edge` (amber), critical → `--color-status-danger` (red). The project **name** text, separately, is coloured via the row's own `pillar_var` (`--color-pillar-security` for SecureChat, `--color-pillar-ai` for Fábula) so the dot still reads as "status" and the name still reads as "which project" — this is exactly the separation that motivated splitting `--color-status-danger` out of `--color-pillar-security` (see [Design tokens](#design-tokens-from-_tokensscss)); before the split, a healthy-but-still-named-security-red SecureChat row looked alarmed even when its dot was green.
- `LlmServiceHealth` metric fields are typed `number | null | undefined` (`?: number | null`) rather than the stricter `number | null` used elsewhere — the backend has been observed to omit fields entirely (not send `null`) when a service's data isn't populated yet, so the formatters treat "absent" and "explicit null" identically, both rendering as `—`
- When a row's `source` is `"unavailable"` (Monitoring Links couldn't reach that app's `/internal/llm-metrics` endpoint, or the shared-secret auth failed), a small `no data` tag renders on the row, same honest-degraded convention as pipeline health's `counters only` tag
- Thresholds are derived server-side by Monitoring Links, mirroring the same "keep both in sync" convention as pipeline health's `derivePipelineStatus`

## Cost panel behaviour

- Renders inside the existing `.mc__frame`, below the LLM health panel — one row per GCP project in payload order: `securechat`, `fabula-infantil`, `monitoring-links`, `vergaraverse`. All four appear here (unlike LLM health, which only covers the two LLM-backed apps), since every project incurs GCP infra cost even without an LLM in its request path.
- Panel header reads `COST · <Month YYYY>`, derived from the payload's `invoice_month` (`"202607"` → `Jul 2026`)
- Per-row stats: `mtd` (month-to-date net cost, primary/emphasized) and `prev` (previous invoice month total, dimmer secondary text)
- Status dot reuses the same pillar tokens as the sibling panels: healthy → `--color-pillar-infra` (green), warning → `--color-pillar-edge` (amber). There is no `critical` state for cost — it's informational, not an outage. The project **name** text is coloured via a component-local `PROJECT_PILLAR_VARS` map (`securechat` → `--color-pillar-security`, `fabula-infantil` → `--color-pillar-ai`, `monitoring-links` → `--color-pillar-infra`, `vergaraverse` → `--color-pillar-edge`), same dot-vs-name colour separation as llm-health — the payload doesn't carry a `pillar_var` field per row the way `llm_health` does, so this map lives in the component.
- `mtd`/`prev_month` are formatted with `Intl.NumberFormat("pt-BR", { style: "currency", currency })` using the payload's own `currency` field (expected `"BRL"`, rendering e.g. `R$ 21,40`) rather than a hand-rolled currency-symbol map — this gets symbol, decimal separator, and spacing right for whatever code the billing account reports.
- `CostProjectRow` fields are typed `?: number | null` (absent and explicit `null` both render `—`), same loose-typing rationale as `LlmServiceHealth` — treat "field omitted" and "field sent null" identically rather than assuming the backend is consistent about which one it does.
- An optional footer line (`total R$ 62,30 mtd`) renders only when every row's `mtd` is non-null — a single missing project cost hides the total rather than showing a misleading partial sum.
- When the response's `cost_health.source` is `"cache-stale"` (Monitoring Links' cached BigQuery aggregation is older than 48h), a small `stale` tag renders next to the panel title, same honest-degraded convention as `counters only` / `no data`. Unlike `llm_health`'s `"unavailable"` source, this is **not** retried with backoff in `status.service.ts` — a stale cache is a calm, long-lived degraded state (the next scheduled BigQuery query fixes it), not a transient blip a quick re-poll would resolve.
- Thresholds (`healthy` | `warning`, no `critical`) are derived server-side by Monitoring Links' `deriveCostStatus`, mirroring the same "keep both in sync" convention as pipeline health's `derivePipelineStatus` and LLM health's threshold derivation.
- **Scope: GCP costs only.** The payload comes from Cloud Billing's BigQuery export — it has no visibility into Vercel, Cloudflare, OpenAI, fal.ai, or Neon spend, all of which these projects also incur. This is a deliberate scope boundary (see ADR-003), not a gap to "fix" by adding more providers later; a true all-up cost figure would need per-provider aggregation that doesn't exist yet.
- `cost_health` itself is optional on the payload — when absent, the panel renders nothing (no empty frame), same convention as `pipeline_health` and `llm_health`.

## What NOT to do

- Do not use SVG for architecture diagrams — SVG `width:100%; height:auto` does not scale reliably inside a flex column card. The CSS pipeline approach replaced it deliberately.
- Do not add UI libraries (no Angular Material, no Bootstrap) — bespoke CSS only
- Do not add comments explaining what the code does — only add a comment when the WHY is non-obvious

## Lighthouse targets (production)

Performance ≥ 98 · Accessibility 100 · Best Practices 100 · SEO 100 · FCP < 0.8 s

## Deployment

Push to `main` → Cloudflare Pages auto-deploys. No manual deploy step needed.
No `_redirects` file needed — SSG pre-renders all routes to static HTML, Cloudflare Pages serves them directly. Do NOT add `/* /index.html 200`; Cloudflare rejects it as an infinite loop.

## Phase 0 (prerequisite — separate repo) — done

The Mission Control widget needs a public endpoint on Monitoring Links:
`GET https://api.monitoringlinks.com/api/public/status`
Returns JSON with `{ generated_at, services: [{ name, url, status, latency_ms?, uptime_30d, last_incident, thresholds?, history? }], pipeline_health?: { source: "cloud-monitoring" | "counters-fallback", generated_at, topics: [{ name, backlog, oldest_unacked_age_s, ack_count_24h, nack_count_24h, dlq_count, status }] } }`.
CORS must allow `https://mvergara.net`, `https://www.mvergara.net`, and `http://localhost:4200`.
This endpoint is live in production; if the whole request fails (network/timeout), the widget falls back to the static mock in `status.service.ts`, which includes a plausible `pipeline_health` block so the panel still renders.

## Phase 1 (LLM Observability, ADR-002) — done

Rejected a managed/self-hosted LLM observability platform (Langfuse, Phoenix) as overkill for two low-traffic side projects — see ADR-002 (Monitoring Links' `docs/`). Went with bespoke async logging into each app's existing datastore instead:

- **SecureChat** (Spring Boot): writes to a new Neon table `llm_telemetry` via a fire-and-forget `LlmTelemetryService` (separate `@Component`, not a method on `RagService`, to avoid the `@Async` self-invocation proxy trap) on its own bounded `ThreadPoolTaskExecutor`.
- **Fábula Infantil** (Express): writes to a new Firestore collection `llm_telemetry` after each OpenAI/image call, without awaiting the write in the response path.
- Both expose `GET /internal/llm-metrics`, gated by a shared-secret `X-Internal-Key` header (env var pattern: `INTERNAL_METRICS_KEY` on the app side, `LLM_<SERVICE>_KEY`/`LLM_<SERVICE>_URL` on the Monitoring Links poller side — the two must be kept in sync manually, there's no automated secret rotation).
- **Monitoring Links** polls both endpoints (same "poll over HTTP, never hold a foreign DB credential" trust boundary its `checkUrl` cron already uses) and folds the result into the existing `/api/public/status` payload as a `llm_health` sibling to `pipeline_health`, rather than a separate endpoint — one HTTP round trip, one circuit breaker on this side.
- Production deploy is done: the four `LLM_SECURECHAT_KEY/URL`/`LLM_FABULA_KEY/URL` vars are GitHub Secrets injected into Monitoring Links' `deploy-backend.yml`, and both apps' own production environments have the matching shared secret set (SecureChat via GCP Secret Manager on Cloud Run, Fábula via its own deploy secrets).

**Known gotchas hit during rollout** (worth checking first if `llm_health` ever regresses to `source: "unavailable"` again):
- The poller config vars are used as the literal request URL with no path appended — `LLM_SECURECHAT_URL`/`LLM_FABULA_URL` must include the full `/internal/llm-metrics` path, not just the host. Pointing at the app root can return a misleading `200` with no metrics fields, which looks like success but isn't.
- Monitoring Links' backend loads `.env` once via `dotenv.config()` at startup — editing `.env` requires restarting `npm run dev`, `nodemon` does not pick it up.
- The shared secret is symmetric and lives in two independently-deployed repos' env config — a value regenerated on one side (e.g. SecureChat's `INTERNAL_METRICS_KEY`) silently breaks the other side until manually copied over.
- **`LLM_SECURECHAT_URL` no longer points at SecureChat's Cloud Run backend** — as of the fix below, it points at a separate Cloud Function. If `llm_health` for `securechat` ever goes stale/unavailable again, confirm which URL is actually configured before assuming it's the backend that's broken; it may not even be in the request path anymore.
- `fetchStatus()` in `status.service.ts` retries a response containing an `unavailable` `llm_health` service with exponential backoff (2s/4s/8s, `expand()` operator) before giving up — this masks brief transient failures but isn't a substitute for fixing a structurally slow/unreliable upstream (see below).

**SecureChat's Cloud Run JVM cold start (~10–30 s) exceeded the backoff budget (~14 s total) — fixed at the source, not papered over further.** SecureChat's `RagService` now dual-writes telemetry to Firestore alongside its existing Neon write (Postgres write unaffected on Firestore failure or vice versa), and a separate Gen2 Cloud Function (`functions/llm-metrics`, negligible Node cold start) serves `GET .../llm-metrics` reads directly from Firestore, decoupled from the JVM backend entirely. `min-instances=1` was deliberately rejected — it would pay to keep the whole backend (JWT chain, 5 RestClient beans, HikariCP pool) warm 24/7 just to answer a cheap aggregate read. See SecureChat's own CLAUDE.md constraint #14 for the dual-write detail.

## Phase 2 (Per-Project Cost Monitoring, ADR-003) — done

Cost panel below LLM Health, rendering a `cost_health` block folded into `/api/public/status` — see ADR-003 (Monitoring Links' `docs/`) for the full design. Source of truth is Cloud Billing's Detailed usage cost BigQuery export, aggregated by a Monitoring Links cron job (not a new Cloud Function — that repo already owns cron + cache + the status payload) and cached; the frontend never touches BigQuery or holds a cloud credential, same trust boundary as `pipeline_health` and `llm_health`. No changes were needed in SecureChat, Fábula Infantil, or VergaraVerse — cost data comes from the billing export, not app instrumentation. See the [Cost panel behaviour](#cost-panel-behaviour) section above for the frontend contract.

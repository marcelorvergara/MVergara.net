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
| `src/app/services/status.service.ts` | Fetches `/api/public/status` from Monitoring Links, 10 s timeout + 1 auto-retry + fallback + manual refresh |
| `src/app/utils/format-duration.ts` | Shared seconds→human-string formatter, used by Mission Control (incident duration) and the pipeline health panel (oldest-unacked age) |

## Design tokens (from `_tokens.scss`)

**Pillar colours** (one per project, used as `var(--pillar-color)` on each card):
- `--color-pillar-security` — ENP Secure Chat (red `#f55b5b`)
- `--color-pillar-ai` — Fábula Infantil (purple `#a855f7`)
- `--color-pillar-infra` — Monitoring Links (green `#22c55e`)
- `--color-pillar-edge` — VergaraVerse (amber `#f59e0b`)

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
- Status dot colour reuses existing pillar tokens, not new colours: healthy → `--color-pillar-infra` (green), warning → `--color-pillar-edge` (amber), critical → `--color-pillar-security` (red)
- Thresholds (mirrors backend `derivePipelineStatus` in Monitoring Links' `publicStatus.service.ts` — keep both in sync if either changes):
  - `critical` if `dlq_count > 0` or `oldest_unacked_age_s > 900` (15 min)
  - `warning` if `backlog > 0`, or `nack_count_24h > 0`, or `oldest_unacked_age_s > 300` (5 min)
  - `healthy` otherwise
- When the response's `pipeline_health.source` is `"counters-fallback"` (Cloud Monitoring IAM not granted, or query failed), a small `counters only` tag renders next to the panel title — this is a degraded-but-honest state, not an error, so it never blocks rendering
- `PipelineTopic` fields are `number | null` — `null` renders as `—`; the `alert-events` topic is always `null` in fallback mode (no DB dependency in `alertservice`)

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

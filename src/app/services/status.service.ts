import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timeout, retry, catchError, expand, timer, switchMap, EMPTY } from 'rxjs';

export type ServiceStatus = 'up' | 'down' | 'unknown';

export interface HistoryPoint {
  ts: string;
  latency_ms: number;
  status: ServiceStatus;
}

export interface Thresholds {
  warning: number;
  danger: number;
}

export interface LastIncident {
  started_at: string;
  ended_at: string;
  duration_seconds: number;
}

export interface ServiceHealth {
  name: string;
  url: string;
  status: ServiceStatus;
  latency_ms?: number;
  uptime_30d: number | null;
  last_incident: LastIncident | null;
  thresholds?: Thresholds;
  history?: HistoryPoint[];
}

export type PipelineSource = 'cloud-monitoring' | 'counters-fallback';
export type PipelineTopicStatus = 'healthy' | 'warning' | 'critical';

export interface PipelineTopic {
  name: string;
  backlog: number | null;
  oldest_unacked_age_s: number | null;
  ack_count_24h: number | null;
  nack_count_24h: number | null;
  dlq_count: number | null;
  status: PipelineTopicStatus;
}

export interface PipelineHealth {
  source: PipelineSource;
  generated_at: string;
  topics: PipelineTopic[];
}

export type LlmServiceSource = 'internal-endpoint' | 'unavailable';
export type LlmServiceStatus = 'healthy' | 'warning' | 'critical';

export interface LlmServiceHealth {
  id: string;
  pillar_var: string;
  source: LlmServiceSource;
  status: LlmServiceStatus;
  requests_24h?: number | null;
  avg_latency_ms?: number | null;
  tokens_24h?: number | null;
  cost_usd_24h?: number | null;
  error_rate_pct?: number | null;
}

export interface LlmHealth {
  generated_at: string;
  window_hours: number;
  services: LlmServiceHealth[];
}

export type CostHealthSource = 'bigquery-export' | 'cache-stale';
export type CostStatus = 'healthy' | 'warning';

export interface CostProjectRow {
  name: string;
  mtd?: number | null;
  prev_month?: number | null;
  status: CostStatus;
}

export interface CostHealth {
  source: CostHealthSource;
  generated_at: string;
  invoice_month: string;
  currency: string;
  projects: CostProjectRow[];
}

export interface StatusResponse {
  generated_at: string;
  services: ServiceHealth[];
  pipeline_health?: PipelineHealth;
  llm_health?: LlmHealth;
  cost_health?: CostHealth;
}

export type WidgetState = 'loading' | 'live' | 'fallback';

const STATUS_API = isDevMode()
  ? 'http://localhost:3001/api/public/status'
  : 'https://api.monitoringlinks.com/api/public/status';
const TIMEOUT_MS = 10_000;

// Retries with backoff when a service reports `source: "unavailable"` — this is the
// signature of a transient Cloud Run cold start on the polled app, not a real outage,
// so a short delayed re-poll of Monitoring Links usually self-heals within a few seconds.
const LLM_BACKOFF_MAX_ATTEMPTS = 3;
const LLM_BACKOFF_BASE_MS = 2000;

function hasUnavailableLlmService(response: StatusResponse): boolean {
  return (response.llm_health?.services ?? []).some(s => s.source === 'unavailable');
}

const FALLBACK_DATA: StatusResponse = {
  generated_at: new Date().toISOString(),
  services: [
    { name: 'ENP Secure Chat', url: 'https://enpsecurechat.com',     status: 'unknown', uptime_30d: null, last_incident: null },
    { name: 'Fábula Infantil', url: 'https://fabulainfantil.com.br', status: 'unknown', uptime_30d: null, last_incident: null },
    { name: 'MVergara.net',    url: 'https://mvergara.net',          status: 'unknown', uptime_30d: null, last_incident: null },
    { name: 'VergaraVerse',    url: 'https://vergaraverse.com',      status: 'unknown', uptime_30d: null, last_incident: null },
  ],
  pipeline_health: {
    source: 'counters-fallback',
    generated_at: new Date().toISOString(),
    topics: [
      { name: 'url-check-tasks', backlog: null, oldest_unacked_age_s: null, ack_count_24h: null, nack_count_24h: null, dlq_count: null, status: 'healthy' },
      { name: 'alert-events',    backlog: null, oldest_unacked_age_s: null, ack_count_24h: null, nack_count_24h: null, dlq_count: null, status: 'healthy' },
    ],
  },
  llm_health: {
    generated_at: new Date().toISOString(),
    window_hours: 24,
    services: [
      { id: 'securechat', pillar_var: '--color-pillar-security', source: 'unavailable', status: 'healthy', requests_24h: null, avg_latency_ms: null, tokens_24h: null, cost_usd_24h: null, error_rate_pct: null },
      { id: 'fabula-infantil', pillar_var: '--color-pillar-ai', source: 'unavailable', status: 'healthy', requests_24h: null, avg_latency_ms: null, tokens_24h: null, cost_usd_24h: null, error_rate_pct: null },
    ],
  },
  cost_health: {
    source: 'bigquery-export',
    generated_at: new Date().toISOString(),
    invoice_month: new Date().toISOString().slice(0, 7).replace('-', ''),
    currency: 'BRL',
    projects: [
      { name: 'vergaraverse', mtd: 0.07, prev_month: 1.47, status: 'healthy' },
      { name: 'fabula-infantil', mtd: 0.18, prev_month: 0.77, status: 'healthy' },
      { name: 'monitoring-links', mtd: 0.15, prev_month: 1.46, status: 'healthy' },
      { name: 'securechat', mtd: 11.9, prev_month: 164.92, status: 'healthy' },
    ],
  },
};

@Injectable({ providedIn: 'root' })
export class StatusService {
  private readonly http = inject(HttpClient);

  private fetchStatusOnce(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(STATUS_API).pipe(timeout(TIMEOUT_MS));
  }

  fetchStatus(): Observable<StatusResponse> {
    return this.fetchStatusOnce().pipe(
      retry(1),
      expand((response, attempt) => {
        if (attempt >= LLM_BACKOFF_MAX_ATTEMPTS || !hasUnavailableLlmService(response)) {
          return EMPTY;
        }
        const delayMs = LLM_BACKOFF_BASE_MS * 2 ** attempt;
        return timer(delayMs).pipe(
          switchMap(() => this.fetchStatusOnce()),
          catchError(() => EMPTY),
        );
      }),
      catchError(() => of(FALLBACK_DATA)),
    );
  }
}

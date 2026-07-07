import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timeout, retry, catchError } from 'rxjs';

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

export interface StatusResponse {
  generated_at: string;
  services: ServiceHealth[];
  pipeline_health?: PipelineHealth;
  llm_health?: LlmHealth;
}

export type WidgetState = 'loading' | 'live' | 'fallback';

const STATUS_API = isDevMode()
  ? 'http://localhost:3001/api/public/status'
  : 'https://api.monitoringlinks.com/api/public/status';
const TIMEOUT_MS = 10_000;

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
};

@Injectable({ providedIn: 'root' })
export class StatusService {
  private readonly http = inject(HttpClient);

  fetchStatus(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(STATUS_API).pipe(
      timeout(TIMEOUT_MS),
      retry(1),
      catchError(() => of(FALLBACK_DATA)),
    );
  }
}

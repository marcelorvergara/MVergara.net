import { Injectable, inject } from '@angular/core';
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

export interface StatusResponse {
  generated_at: string;
  services: ServiceHealth[];
}

export type WidgetState = 'loading' | 'live' | 'fallback';

const STATUS_API = 'https://api.monitoringlinks.com/api/public/status';
const TIMEOUT_MS = 10_000;

const FALLBACK_DATA: StatusResponse = {
  generated_at: new Date().toISOString(),
  services: [
    { name: 'ENP Secure Chat', url: 'https://enpsecurechat.com',     status: 'unknown', uptime_30d: null, last_incident: null },
    { name: 'Fábula Infantil', url: 'https://fabulainfantil.com.br', status: 'unknown', uptime_30d: null, last_incident: null },
    { name: 'MVergara.net',    url: 'https://mvergara.net',          status: 'unknown', uptime_30d: null, last_incident: null },
    { name: 'VergaraVerse',    url: 'https://vergaraverse.com',      status: 'unknown', uptime_30d: null, last_incident: null },
  ],
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

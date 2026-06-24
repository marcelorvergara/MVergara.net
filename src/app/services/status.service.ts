import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timeout, catchError } from 'rxjs';

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

export interface ServiceHealth {
  name: string;
  url: string;
  status: ServiceStatus;
  latency_ms?: number;
  thresholds?: Thresholds;
  history?: HistoryPoint[];
}

export interface StatusResponse {
  generated_at: string;
  services: ServiceHealth[];
}

export type WidgetState = 'loading' | 'live' | 'fallback';

const STATUS_API = 'https://api.monitoringlinks.com/api/public/status';
const TIMEOUT_MS = 2000;

const FALLBACK_DATA: StatusResponse = {
  generated_at: new Date().toISOString(),
  services: [
    { name: 'ENP Secure Chat', url: 'https://enpsecurechat.com',     status: 'unknown' },
    { name: 'Fábula Infantil', url: 'https://fabulainfantil.com.br', status: 'unknown' },
    { name: 'MVergara.net',    url: 'https://mvergara.net',          status: 'unknown' },
    { name: 'VergaraVerse',    url: 'https://vergaraverse.com',      status: 'unknown' },
  ],
};

@Injectable({ providedIn: 'root' })
export class StatusService {
  private readonly http = inject(HttpClient);

  fetchStatus(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(STATUS_API).pipe(
      timeout(TIMEOUT_MS),
      catchError(() => of(FALLBACK_DATA)),
    );
  }
}

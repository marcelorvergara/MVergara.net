import { Component, Input } from '@angular/core';
import { LlmServiceHealth } from '../../../services/status.service';

const SERVICE_LABELS: Record<string, string> = {
  'securechat': 'SecureChat',
  'fabula-infantil': 'Fábula Infantil',
};

@Component({
  selector: 'app-llm-health',
  imports: [],
  templateUrl: './llm-health.html',
  styleUrl: './llm-health.scss',
})
export class LlmHealthComponent {
  @Input() services: LlmServiceHealth[] = [];

  protected label(id: string): string {
    return SERVICE_LABELS[id] ?? id;
  }

  protected accentColor(pillarVar: string): string {
    return `var(${pillarVar})`;
  }

  protected formatCount(n: number | null | undefined): string {
    return n === null || n === undefined ? '—' : n.toLocaleString();
  }

  protected formatTokens(n: number | null | undefined): string {
    if (n === null || n === undefined) return '—';
    return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();
  }

  protected formatLatency(ms: number | null | undefined): string {
    if (ms === null || ms === undefined) return '—';
    return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
  }

  protected formatCost(usd: number | null | undefined): string {
    return usd === null || usd === undefined ? '—' : `$${usd.toFixed(2)}`;
  }

  protected formatErrorRate(pct: number | null | undefined): string {
    return pct === null || pct === undefined ? '—' : `${pct.toFixed(1)}%`;
  }
}

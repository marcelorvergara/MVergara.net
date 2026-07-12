import { Component, Input } from '@angular/core';
import { CostHealthSource, CostProjectRow } from '../../../services/status.service';

const PROJECT_LABELS: Record<string, string> = {
  'securechat': 'ENP Secure Chat',
  'fabula-infantil': 'Fábula Infantil',
  'monitoring-links': 'Monitoring Links',
  'vergaraverse': 'VergaraVerse',
};

const PROJECT_PILLAR_VARS: Record<string, string> = {
  'securechat': '--color-pillar-security',
  'fabula-infantil': '--color-pillar-ai',
  'monitoring-links': '--color-pillar-infra',
  'vergaraverse': '--color-pillar-edge',
};

@Component({
  selector: 'app-cost-health',
  imports: [],
  templateUrl: './cost-health.html',
  styleUrl: './cost-health.scss',
})
export class CostHealthComponent {
  @Input() projects: CostProjectRow[] = [];
  @Input() source: CostHealthSource = 'bigquery-export';
  @Input() invoiceMonth = '';
  @Input() currency = 'BRL';

  protected label(name: string): string {
    return PROJECT_LABELS[name] ?? name;
  }

  protected accentColor(name: string): string {
    return `var(${PROJECT_PILLAR_VARS[name] ?? '--color-text-muted'})`;
  }

  protected formatMonth(invoiceMonth: string): string {
    if (invoiceMonth.length !== 6) return invoiceMonth;
    const year = Number(invoiceMonth.slice(0, 4));
    const month = Number(invoiceMonth.slice(4, 6)) - 1;
    return new Date(year, month, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  // Currency comes from the payload, not hardcoded — Intl handles symbol,
  // decimal separator and spacing correctly for whatever code the billing
  // account reports, instead of a hand-rolled symbol map.
  protected formatCurrency(n: number | null | undefined): string {
    if (n === null || n === undefined) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: this.currency }).format(n);
  }

  protected totalMtd(): number | null {
    if (this.projects.length === 0) return null;
    let total = 0;
    for (const p of this.projects) {
      if (p.mtd === null || p.mtd === undefined) return null;
      total += p.mtd;
    }
    return total;
  }
}

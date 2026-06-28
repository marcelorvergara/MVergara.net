import { Component, OnInit, inject, signal } from '@angular/core';
import { StatusService, ServiceHealth, WidgetState } from '../../services/status.service';
import { SparklineComponent } from './sparkline/sparkline';

@Component({
  selector: 'app-mission-control',
  imports: [SparklineComponent],
  templateUrl: './mission-control.html',
  styleUrl: './mission-control.scss',
})
export class MissionControl implements OnInit {
  private readonly statusService = inject(StatusService);

  protected readonly state = signal<WidgetState>('loading');
  protected readonly services = signal<ServiceHealth[]>([]);
  protected readonly generatedAt = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected refresh(): void {
    this.state.set('loading');
    this.services.set([]);
    this.generatedAt.set(null);
    this.load();
  }

  private load(): void {
    this.statusService.fetchStatus().subscribe({
      next: (response) => {
        this.services.set(response.services);
        this.generatedAt.set(response.generated_at);
        const isLive = response.services.some(s => s.status !== 'unknown');
        this.state.set(isLive ? 'live' : 'fallback');
      },
      error: () => {
        this.state.set('fallback');
      },
    });
  }

  protected formatTime(iso: string): string {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  protected formatDuration(seconds: number): string {
    if (seconds <= 0) return '< 1s';
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  protected formatTimeAgo(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
  }
}

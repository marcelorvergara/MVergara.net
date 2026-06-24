import { Component, OnInit, inject, signal } from '@angular/core';
import { StatusService, ServiceHealth, WidgetState } from '../../services/status.service';

@Component({
  selector: 'app-mission-control',
  imports: [],
  templateUrl: './mission-control.html',
  styleUrl: './mission-control.scss',
})
export class MissionControl implements OnInit {
  private readonly statusService = inject(StatusService);

  protected readonly state = signal<WidgetState>('loading');
  protected readonly services = signal<ServiceHealth[]>([]);
  protected readonly generatedAt = signal<string | null>(null);

  ngOnInit(): void {
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
}

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { StatusService, ServiceHealth, PipelineHealth, LlmHealth, WidgetState } from '../../services/status.service';
import { SparklineComponent } from './sparkline/sparkline';
import { PipelineHealthComponent } from './pipeline-health/pipeline-health';
import { LlmHealthComponent } from './llm-health/llm-health';
import { formatDuration } from '../../utils/format-duration';

const CHECK_INTERVAL_S = 300;
const COUNTDOWN_TICK_S = 10;

@Component({
  selector: 'app-mission-control',
  imports: [SparklineComponent, PipelineHealthComponent, LlmHealthComponent],
  templateUrl: './mission-control.html',
  styleUrl: './mission-control.scss',
})
export class MissionControl implements OnInit, OnDestroy {
  private readonly statusService = inject(StatusService);

  protected readonly state = signal<WidgetState>('loading');
  protected readonly services = signal<ServiceHealth[]>([]);
  protected readonly generatedAt = signal<string | null>(null);
  protected readonly pipelineHealth = signal<PipelineHealth | null>(null);
  protected readonly llmHealth = signal<LlmHealth | null>(null);
  protected readonly secondsUntilNextCheck = signal(CHECK_INTERVAL_S);

  private countdownHandle?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.load();
    this.countdownHandle = setInterval(() => this.tick(), COUNTDOWN_TICK_S * 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownHandle);
  }

  protected refresh(): void {
    this.state.set('loading');
    this.services.set([]);
    this.generatedAt.set(null);
    this.pipelineHealth.set(null);
    this.llmHealth.set(null);
    this.secondsUntilNextCheck.set(CHECK_INTERVAL_S);
    this.load();
  }

  private tick(): void {
    const remaining = this.secondsUntilNextCheck() - COUNTDOWN_TICK_S;
    if (remaining > 0) {
      this.secondsUntilNextCheck.set(remaining);
      return;
    }
    this.secondsUntilNextCheck.set(CHECK_INTERVAL_S);
    this.load();
  }

  protected formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  private load(): void {
    this.statusService.fetchStatus().subscribe({
      next: (response) => {
        this.services.set(response.services);
        this.generatedAt.set(response.generated_at);
        this.pipelineHealth.set(response.pipeline_health ?? null);
        this.llmHealth.set(response.llm_health ?? null);
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
    return formatDuration(seconds);
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

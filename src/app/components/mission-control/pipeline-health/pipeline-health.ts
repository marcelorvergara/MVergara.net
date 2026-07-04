import { Component, Input } from '@angular/core';
import { PipelineSource, PipelineTopic } from '../../../services/status.service';
import { formatDuration } from '../../../utils/format-duration';

const TOPIC_LABELS: Record<string, string> = {
  'url-check-tasks': 'URL Checks',
  'alert-events': 'Alerts',
};

@Component({
  selector: 'app-pipeline-health',
  imports: [],
  templateUrl: './pipeline-health.html',
  styleUrl: './pipeline-health.scss',
})
export class PipelineHealthComponent {
  @Input() topics: PipelineTopic[] = [];
  @Input() source: PipelineSource = 'counters-fallback';

  protected readonly formatDuration = formatDuration;

  protected label(name: string): string {
    return TOPIC_LABELS[name] ?? name;
  }

  protected formatAge(seconds: number | null): string {
    return seconds === null ? '—' : this.formatDuration(seconds);
  }

  protected formatCount(n: number | null): string {
    return n === null ? '—' : n.toLocaleString();
  }
}

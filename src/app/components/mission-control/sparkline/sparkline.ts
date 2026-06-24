import { Component, Input } from '@angular/core';
import { HistoryPoint, Thresholds } from '../../../services/status.service';

const SVG_W = 200;
const SVG_H = 28;
const PAD = 2;

@Component({
  selector: 'app-sparkline',
  imports: [],
  templateUrl: './sparkline.html',
  styleUrl: './sparkline.scss',
})
export class SparklineComponent {
  @Input() history: HistoryPoint[] = [];
  @Input() thresholds?: Thresholds;

  private get yMax(): number {
    const latencies = this.history.map(h => h.latency_ms);
    const dangerVal = this.thresholds?.danger ?? 0;
    return Math.max(dangerVal, ...latencies) * 1.1 || 1;
  }

  private toY(latency: number): number {
    return SVG_H - PAD - ((latency / this.yMax) * (SVG_H - PAD * 2));
  }

  private toX(index: number): number {
    const n = this.history.length;
    return n === 1 ? SVG_W / 2 : (index / (n - 1)) * SVG_W;
  }

  get polylinePoints(): string {
    return this.history
      .map((h, i) => `${this.toX(i)},${this.toY(h.latency_ms)}`)
      .join(' ');
  }

  get warningY(): number | null {
    return this.thresholds ? this.toY(this.thresholds.warning) : null;
  }

  get dangerY(): number | null {
    return this.thresholds ? this.toY(this.thresholds.danger) : null;
  }

  get downPoints(): HistoryPoint[] {
    return this.history.filter(h => h.status === 'down');
  }

  ptX(pt: HistoryPoint): number {
    return this.toX(this.history.indexOf(pt));
  }

  ptY(pt: HistoryPoint): number {
    return this.toY(pt.latency_ms);
  }
}

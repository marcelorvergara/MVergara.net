import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  protected readonly loadTime = signal<number | null>(null);
  protected readonly currentYear = new Date().getFullYear();

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const ms = nav
        ? Math.round(nav.loadEventEnd > 0 ? nav.loadEventEnd - nav.startTime : performance.now())
        : Math.round(performance.now());
      this.loadTime.set(ms);
    }
  }
}

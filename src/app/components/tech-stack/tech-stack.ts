import { Component, computed, signal } from '@angular/core';
import { CERTIFICATIONS, SKILL_BADGES } from '../../data/credentials.data';

const DEFAULT_VISIBLE_BADGES = 4;

@Component({
  selector: 'app-tech-stack',
  imports: [],
  templateUrl: './tech-stack.html',
  styleUrl: './tech-stack.scss',
})
export class TechStack {
  certifications = CERTIFICATIONS;
  skillBadges = SKILL_BADGES;

  showAllBadges = signal(false);

  visibleBadges = computed(() =>
    this.showAllBadges() ? this.skillBadges : this.skillBadges.slice(0, DEFAULT_VISIBLE_BADGES)
  );
  hiddenBadgeCount = this.skillBadges.length - DEFAULT_VISIBLE_BADGES;

  toggleBadges() {
    this.showAllBadges.update(v => !v);
  }

  dateLabel(c: { date: string; dateKind: 'valid-through' | 'issued' }): string {
    return c.dateKind === 'valid-through' ? `valid through ${c.date}` : `issued ${c.date}`;
  }
}

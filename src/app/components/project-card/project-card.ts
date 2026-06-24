import { Component, input, signal, HostListener } from '@angular/core';
import { Project } from '../../data/projects.data';

@Component({
  selector: 'app-project-card',
  imports: [],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  project = input.required<Project>();
  overlayOpen = signal(false);

  toggle() {
    this.overlayOpen.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!(e.target as Element).closest('app-project-card')) {
      this.overlayOpen.set(false);
    }
  }

  protected getNodeById(id: string) {
    return this.project().nodes.find(n => n.id === id);
  }
}

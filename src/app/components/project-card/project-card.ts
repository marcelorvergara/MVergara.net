import { Component, input } from '@angular/core';
import { Project } from '../../data/projects.data';

@Component({
  selector: 'app-project-card',
  imports: [],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  project = input.required<Project>();

  protected getNodeById(id: string) {
    return this.project().nodes.find(n => n.id === id);
  }
}

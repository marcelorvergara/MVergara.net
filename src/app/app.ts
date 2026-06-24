import { Component } from '@angular/core';
import { Hero } from './components/hero/hero';
import { MissionControl } from './components/mission-control/mission-control';
import { ProjectCard } from './components/project-card/project-card';
import { TechStack } from './components/tech-stack/tech-stack';
import { Footer } from './components/footer/footer';
import { PROJECTS } from './data/projects.data';

@Component({
  selector: 'app-root',
  imports: [Hero, MissionControl, ProjectCard, TechStack, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly projects = PROJECTS;
}

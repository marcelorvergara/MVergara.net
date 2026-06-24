export interface SvgNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface SvgEdge {
  from: string;
  to: string;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  pillar: string;
  pillarVar: string;
  hook: string;
  rationale: string;
  nodes: SvgNode[];
  edges: SvgEdge[];
}

export const PROJECTS: Project[] = [
  {
    id: 'enp-secure-chat',
    name: 'ENP Secure Chat',
    url: 'https://enpsecurechat.com',
    pillar: 'Security & Real-Time Protocol',
    pillarVar: '--color-pillar-security',
    hook: 'End-to-end encrypted messaging with zero data persistence beyond the session boundary.',
    rationale:
      'Designed with an encrypted WebSocket layer and strict session isolation so that no message payload survives beyond its session boundary, eliminating the risk of retrospective data exposure. Spring Boot\'s reactive stack handles high concurrency without thread-per-connection overhead, sustaining sub-100ms delivery even under bursts.',
    nodes: [
      { id: 'client', label: 'Client (Angular)', x: 20, y: 50 },
      { id: 'gateway', label: 'Secure Gateway', x: 120, y: 50 },
      { id: 'engine', label: 'RT Engine (Spring)', x: 220, y: 50 },
      { id: 'store', label: 'Session Store', x: 320, y: 50 },
    ],
    edges: [
      { from: 'client', to: 'gateway' },
      { from: 'gateway', to: 'engine' },
      { from: 'engine', to: 'store' },
    ],
  },
  {
    id: 'fabula-infantil',
    name: 'Fábula Infantil',
    url: 'https://fabulainfantil.com',
    pillar: 'AI Engineering & Creative UX',
    pillarVar: '--color-pillar-ai',
    hook: 'AI-generated children\'s stories with structured prompt engineering for age-appropriate output.',
    rationale:
      'Wrapped generative AI model calls behind a structured prompt-engineering layer to enforce age-appropriate, contextually coherent story output rather than exposing raw model responses directly. Angular\'s declarative component model enabled dynamic content injection while preserving the accessibility requirements a child-facing product demands.',
    nodes: [
      { id: 'ui', label: 'Story UI (Angular)', x: 20, y: 50 },
      { id: 'prompt', label: 'Prompt Layer', x: 120, y: 50 },
      { id: 'ai', label: 'AI Model API', x: 220, y: 50 },
      { id: 'cdn', label: 'Content CDN', x: 320, y: 50 },
    ],
    edges: [
      { from: 'ui', to: 'prompt' },
      { from: 'prompt', to: 'ai' },
      { from: 'ai', to: 'cdn' },
    ],
  },
  {
    id: 'monitoring-links',
    name: 'Monitoring Links',
    url: 'https://www.monitoringlinks.com',
    pillar: 'Infrastructure & High Availability',
    pillarVar: '--color-pillar-infra',
    hook: 'Distributed uptime monitoring with configurable polling and automated alerting.',
    rationale:
      'Built with a configurable polling architecture rather than webhook reliance, enabling passive reliability tracking of any target regardless of whether it supports push notifications. A time-series data model was chosen over relational storage to optimise continuous-write throughput and enable fast historical trend queries.',
    nodes: [
      { id: 'scheduler', label: 'Scheduler', x: 20, y: 50 },
      { id: 'probes', label: 'Probe Workers', x: 120, y: 50 },
      { id: 'ts', label: 'Time-Series DB', x: 220, y: 50 },
      { id: 'alerts', label: 'Alert Engine', x: 320, y: 50 },
    ],
    edges: [
      { from: 'scheduler', to: 'probes' },
      { from: 'probes', to: 'ts' },
      { from: 'ts', to: 'alerts' },
    ],
  },
  {
    id: 'vergaraverse',
    name: 'VergaraVerse',
    url: 'https://vergaraverse.com',
    pillar: 'Edge Computing & Telemetry',
    pillarVar: '--color-pillar-edge',
    hook: 'Local-first hardware telemetry parsing via WebAssembly — zero server compute, sub-ms rendering.',
    rationale:
      'Compiled the binary telemetry parser to WebAssembly via Go/TinyGo to move all heavy parsing workload to the client, eliminating server round-trips and achieving sub-millisecond frame rendering independent of network conditions. This local-first architecture keeps the visualisation layer fully functional even under degraded connectivity.',
    nodes: [
      { id: 'hw', label: 'Hardware Feed', x: 20, y: 50 },
      { id: 'wasm', label: 'Wasm Parser (Go)', x: 120, y: 50 },
      { id: 'state', label: 'Client State', x: 220, y: 50 },
      { id: 'viz', label: 'Visualisation', x: 320, y: 50 },
    ],
    edges: [
      { from: 'hw', to: 'wasm' },
      { from: 'wasm', to: 'state' },
      { from: 'state', to: 'viz' },
    ],
  },
];

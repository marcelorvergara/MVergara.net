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
    hook: 'Enterprise RAG assistant for O&G — FGA enforced inside Qdrant before any chunk is ranked, so restricted documents are mathematically invisible to the LLM.',
    rationale:
      'Enforcing authorization as a Qdrant must_not filter before embedding ranking — not post-filtering in Java — means restricted documents never influence semantic scores, closing the ranking-signal leak that post-retrieval filtering leaves open. The RAG orchestration is deliberately non-transactional: holding one of Neon\'s five HikariCP connections open during a 15–60 s LLM call would exhaust the pool entirely for all concurrent users.',
    nodes: [
      { id: 'client', label: 'Angular FE', x: 10, y: 38 },
      { id: 'gateway', label: 'Spring RAG', x: 120, y: 38 },
      { id: 'engine', label: 'Qdrant FGA', x: 120, y: 102 },
      { id: 'store', label: 'Claude + DLP', x: 10, y: 102 },
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
    hook: 'Stateless multi-turn narrative control via GPT-4o mini: full choice history forwarded each request maintains continuity across three branching acts, with gpt-image-1 illustrations assembled into an animated 3D book.',
    rationale:
      'Each story part is a multi-turn conversation with the full choice history forwarded on every request, so the model maintains narrative continuity across three branching acts without any server-side session state. Illustrations land in a temporary GCS path during composition and are re-keyed to a SHA-256 story ID only on share, making the URL deterministic and cacheable while storing nothing until the user explicitly publishes.',
    nodes: [
      { id: 'ui', label: 'Next.js UI', x: 10, y: 38 },
      { id: 'prompt', label: 'Express API', x: 120, y: 38 },
      { id: 'ai', label: 'GPT-4o mini', x: 120, y: 102 },
      { id: 'cdn', label: 'GCS / Firestore', x: 10, y: 102 },
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
    hook: 'URL uptime monitoring — concurrent checks via Promise.allSettled ensure no slow target delays the fleet, with WhatsApp and SMS alerts fired on threshold breach.',
    rationale:
      'Using Promise.allSettled for concurrent URL checks means a single slow or hanging endpoint never blocks the monitoring window for the rest of the fleet — every result is recorded independently of its peers. A dual-database split keeps PostgreSQL for the append-heavy response-time series and MongoDB for OAuth user profile lookups, matching each store to its actual access pattern.',
    nodes: [
      { id: 'scheduler', label: 'App Engine Cron', x: 10, y: 38 },
      { id: 'probes', label: 'Express Check', x: 120, y: 38 },
      { id: 'ts', label: 'PostgreSQL', x: 120, y: 102 },
      { id: 'alerts', label: 'Twilio Alerts', x: 10, y: 102 },
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
    hook: 'GoPro GPMF binary telemetry parsed entirely in-browser via TinyGo WebAssembly — 60 Hz Canvas overlay, frame-accurate WebM export, zero server compute.',
    rationale:
      "TinyGo's lack of reflection support forced every KLV field read to use explicit BigEndian helpers and every result JSON to be built by string concatenation — constraints that produce a parser small enough to fit inside the 64 MB browser heap shared with the 4K video decoder. The Web Worker hosting the WASM instance is terminated immediately after the parse result arrives, releasing the entire WebAssembly.Memory in one atomic step rather than waiting for GC.",
    nodes: [
      { id: 'hw', label: 'GoPro MP4', x: 10, y: 38 },
      { id: 'wasm', label: 'TinyGo WASM', x: 120, y: 38 },
      { id: 'state', label: 'IndexedDB', x: 120, y: 102 },
      { id: 'viz', label: 'Canvas HUD', x: 10, y: 102 },
    ],
    edges: [
      { from: 'hw', to: 'wasm' },
      { from: 'wasm', to: 'state' },
      { from: 'state', to: 'viz' },
    ],
  },
];

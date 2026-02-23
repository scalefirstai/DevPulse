<p align="center">
  <img src="https://img.shields.io/badge/DevPulse-Engineering%20Health%20Metrics-6366f1?style=for-the-badge&labelColor=1e1b4b" alt="DevPulse" />
</p>

<h1 align="center">DevPulse</h1>

<p align="center">
  <strong>Engineering health metrics that tell the truth.</strong><br/>
  Five outcome-oriented KPIs. One balanced view of delivery performance.
</p>

<p align="center">
  <a href="https://github.com/scalefirstai/DevPulse/actions/workflows/ci.yml"><img src="https://github.com/scalefirstai/DevPulse/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/scalefirstai/DevPulse/actions/workflows/codeql.yml"><img src="https://github.com/scalefirstai/DevPulse/actions/workflows/codeql.yml/badge.svg" alt="CodeQL" /></a>
  <a href="https://github.com/scalefirstai/DevPulse/blob/main/LICENSE"><img src="https://img.shields.io/github/license/scalefirstai/DevPulse?color=blue" alt="License" /></a>
  <a href="https://github.com/scalefirstai/DevPulse/releases"><img src="https://img.shields.io/github/v/release/scalefirstai/DevPulse?include_prereleases&label=version" alt="Version" /></a>
  <a href="https://github.com/scalefirstai/DevPulse/stargazers"><img src="https://img.shields.io/github/stars/scalefirstai/DevPulse?style=social" alt="Stars" /></a>
</p>

<p align="center">
  <a href="https://img.shields.io/badge/TypeScript-5.4-3178c6?logo=typescript&logoColor=white"><img src="https://img.shields.io/badge/TypeScript-5.4-3178c6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white"><img src="https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
  <a href="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=black"><img src="https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=black" alt="React" /></a>
  <a href="https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white"><img src="https://img.shields.io/badge/PostgreSQL-16-4169e1?logo=postgresql&logoColor=white" alt="PostgreSQL" /></a>
  <a href="https://img.shields.io/badge/Docker-Ready-2496ed?logo=docker&logoColor=white"><img src="https://img.shields.io/badge/Docker-Ready-2496ed?logo=docker&logoColor=white" alt="Docker" /></a>
  <a href="https://img.shields.io/badge/PRs-welcome-brightgreen"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome" /></a>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> &bull;
  <a href="#-kpis">KPIs</a> &bull;
  <a href="docs/getting-started.md">Docs</a> &bull;
  <a href="docs/api-reference.md">API</a> &bull;
  <a href="CONTRIBUTING.md">Contributing</a> &bull;
  <a href="https://github.com/scalefirstai/DevPulse/discussions">Discussions</a>
</p>

---

## Why DevPulse?

Most engineering metrics tools measure **activity** — commits, PRs, lines of code. DevPulse measures **outcomes** — how fast you ship, how stable your systems are, and whether your architecture is holding up.

- **No vanity metrics.** Five KPIs chosen because they drive real improvement.
- **Balanced by design.** Speed, quality, and sustainability measured together — gaming one hurts the others.
- **Connects to your stack.** GitHub, Jira, PagerDuty, OpsGenie, Jenkins, and more.
- **Self-hosted & private.** Your data stays on your infrastructure. Always.
- **Open source.** MIT licensed. Fork it, extend it, make it yours.

## KPIs

DevPulse tracks five KPIs across four health tiers: **Elite**, **Strong**, **Moderate**, and **Alert**.

| KPI | What it Measures | Unit | Elite | Alert |
|-----|-----------------|------|-------|-------|
| **Cycle Time** | Median first-commit to production deploy | days | < 2d | > 14d |
| **Defect Escape Rate** | Defects discovered post-deployment | % | < 5% | > 25% |
| **Architecture Drift** | Unresolved violations / total rules | % | < 2% | > 15% |
| **MTTRC** | Incident detection to confirmed root cause | hours | < 1h | > 8h |
| **Rework** | PRs touching files changed in last 21 days | % | < 10% | > 30% |

> Each KPI feeds into a composite **Health Score** (0–100) with trend tracking and shift detection.

## Quick Start

### One command with Docker

```bash
git clone https://github.com/scalefirstai/DevPulse.git
cd DevPulse
docker-compose up
```

Open [http://localhost:3000](http://localhost:3000) — demo data loads automatically.

### Local development

```bash
# Prerequisites: Node.js 20+, pnpm 9+

pnpm install
pnpm build
pnpm test

# Start API server (port 4000)
pnpm --filter @devpulse/server dev

# Start dashboard (port 5173)
pnpm --filter @devpulse/dashboard dev
```

## Architecture

```
DevPulse
├── packages/
│   ├── core/            Pure TypeScript — KPI types, calculation engine, health scoring
│   ├── connectors/      Data integrations — GitHub, Jira, PagerDuty, OpsGenie, Jenkins
│   ├── server/          Express API — PostgreSQL, Redis, BullMQ job processing
│   └── dashboard/       React SPA — Recharts, TailwindCSS, dark-first design
│
├── deploy/
│   ├── helm/            Kubernetes Helm charts for production
│   └── nginx.conf       Dashboard reverse proxy config
│
├── docker-compose.yml   Full local stack (Postgres + Redis + API + Dashboard)
└── docs/                Comprehensive documentation
```

### Data Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────────┐
│   GitHub     │────▶│              │────▶│              │────▶│           │
│   Jira       │     │  Connectors  │     │  Calculation  │     │ Dashboard │
│   PagerDuty  │     │   (pull)     │     │   Engine     │     │  (React)  │
│   OpsGenie   │────▶│              │────▶│              │────▶│           │
│   Jenkins    │     └──────────────┘     └──────────────┘     └───────────┘
└─────────────┘            │                     │
                     ┌─────▼─────────────────────▼─────┐
                     │     PostgreSQL + Redis           │
                     │     BullMQ Job Queue             │
                     └─────────────────────────────────┘
```

## Connectors

DevPulse ships with connectors for the most popular engineering tools:

| Connector | Data Collected | KPIs Fed |
|-----------|---------------|----------|
| **GitHub** | PRs, commits, file changes | Cycle Time, Rework |
| **Jira** | Issues, defects, lifecycle | Defect Escape Rate |
| **PagerDuty** | Incidents, timelines | MTTRC |
| **OpsGenie** | Incidents, alerts | MTTRC |
| **GitHub Actions** | Builds, deployments | Cycle Time |
| **Jenkins** | Build pipelines | Cycle Time |
| **ArchUnit** | Architecture rules | Architecture Drift |

> Need a connector that doesn't exist yet? [Open a feature request](https://github.com/scalefirstai/DevPulse/issues/new?template=feature_request.md) or [build one](docs/connector-guide.md) — the base class handles retry, rate limiting, and pagination for you.

## Connect Your Data

1. Copy the example config:
   ```bash
   cp devpulse.config.example.yaml devpulse.config.yaml
   ```

2. Add your credentials:
   ```yaml
   connectors:
     github:
       token: ${GITHUB_TOKEN}
       repos: [org/repo-1, org/repo-2]
     jira:
       host: https://your-org.atlassian.net
       email: ${JIRA_EMAIL}
       token: ${JIRA_TOKEN}
   ```

3. Trigger collection:
   ```bash
   curl -X POST http://localhost:4000/api/collect/trigger
   ```

See the full [Connector Guide](docs/connector-guide.md) for all options.

## Documentation

| Guide | Description |
|-------|-------------|
| [Getting Started](docs/getting-started.md) | Installation, configuration, first run |
| [KPI Definitions](docs/kpi-definitions.md) | Detailed methodology for each metric |
| [API Reference](docs/api-reference.md) | REST endpoints, request/response formats |
| [Connector Guide](docs/connector-guide.md) | Setting up and building data connectors |
| [Architecture](docs/architecture.md) | System design and package structure |
| [Deployment](docs/deployment.md) | Docker, Kubernetes, Helm, and production setup |
| [Security](docs/security.md) | Security model, headers, rate limiting |

## Contributing

We welcome contributions of all kinds. Whether it's a bug fix, new connector, documentation improvement, or feature idea — every contribution matters.

```bash
# Fork & clone
git clone https://github.com/<your-username>/DevPulse.git
cd DevPulse

# Install & verify
pnpm install && pnpm build && pnpm test

# Create a branch
git checkout -b feat/my-change

# Make your changes, then open a PR
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide, including coding standards and PR process.

### Good First Issues

Looking for a place to start? Check out issues labeled [`good first issue`](https://github.com/scalefirstai/DevPulse/labels/good%20first%20issue) — these are scoped, well-described tasks perfect for newcomers.

## Community

- [GitHub Discussions](https://github.com/scalefirstai/DevPulse/discussions) — Questions, ideas, show & tell
- [Issue Tracker](https://github.com/scalefirstai/DevPulse/issues) — Bug reports and feature requests
- [KPI Methodology RFCs](rfcs/README.md) — How we measure matters. Help shape the methodology behind each KPI.
- [Code of Conduct](CODE_OF_CONDUCT.md) — Our community standards

### Star History

If DevPulse helps your team, consider giving it a star — it helps others discover the project.

[![Star History Chart](https://api.star-history.com/svg?repos=scalefirstai/DevPulse&type=Date)](https://star-history.com/#scalefirstai/DevPulse&Date)

## License

[MIT](LICENSE) — Copyright (c) 2026 Selwyn Theo

---

<p align="center">
  Built with conviction that <strong>what you measure shapes what you build</strong>.
</p>

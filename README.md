# DevPulse

Open-source engineering health framework that measures five outcome-oriented KPIs to give teams an objective, balanced view of their delivery performance.

## KPIs

| KPI | What it measures | Unit |
|-----|-----------------|------|
| **Cycle Time** | Median time from first commit to production deploy | days |
| **Defect Escape Rate** | Percentage of defects discovered post-deployment | % |
| **Architecture Drift** | Ratio of unresolved architecture violations to total rules | % |
| **MTTRC** | Median time from incident detection to confirmed root cause | hours |
| **Rework** | Percentage of PRs touching files changed within the last 21 days | % |

Each KPI is classified into four health tiers: **Elite**, **Strong**, **Moderate**, **Alert**.

## Quick Start

```bash
docker-compose up
```

Open [http://localhost:3000](http://localhost:3000). Demo data is loaded automatically.

## Development

```bash
# Prerequisites: Node.js 20+, pnpm 9+

pnpm install
pnpm build
pnpm test

# Start dev servers
pnpm --filter @devpulse/server dev
pnpm --filter @devpulse/dashboard dev
```

## Architecture

```
packages/
  core/         # KPI types, calculation engine, utilities
  connectors/   # Data source integrations (GitHub, Jira, PagerDuty, etc.)
  server/       # Express API, PostgreSQL, BullMQ jobs
  dashboard/    # React + Recharts + TailwindCSS UI
```

## Connect Your Data

1. Create a `devpulse.config.yaml` (see [devpulse.config.example.yaml](devpulse.config.example.yaml))
2. Configure connector credentials (GitHub token, Jira credentials, etc.)
3. Trigger data collection via `POST /api/collect/trigger`

See [docs/connector-guide.md](docs/connector-guide.md) for details.

## Documentation

- [Getting Started](docs/getting-started.md)
- [KPI Definitions](docs/kpi-definitions.md)
- [API Reference](docs/api-reference.md)
- [Connector Guide](docs/connector-guide.md)
- [Deployment](docs/deployment.md)
- [Architecture](docs/architecture.md)

## License

[Apache 2.0](LICENSE)

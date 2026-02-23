## Why

Engineering teams rely on vanity metrics (velocity, story points, bug count) that don't reflect actual delivery health. DevPulse replaces these with five outcome-oriented KPIs — Cycle Time, Defect Escape Rate, Architectural Drift, Mean Time to Root Cause, and Rework % — giving CXOs and engineering leaders an honest view of how their teams are actually performing. This is a new open-source project built from scratch.

## What Changes

- Introduce a full-stack engineering health metrics platform (TypeScript monorepo)
- Build a data collection backend (Node.js/Express) with connectors for GitHub, Jira, CI/CD, PagerDuty, and architecture tools
- Build a React dashboard with KPI cards, trend charts, team comparisons, health radar, and auto-generated insights
- Implement a KPI calculation engine covering all five metrics with threshold-based health scoring (Elite/Strong/Moderate/Alert)
- Implement an insight generation engine with correlation detection, anomaly detection, hotspot detection, and shift tracking
- Provide PostgreSQL timeseries schema with BullMQ/Redis async job processing
- Package for Docker Compose (local dev) and Helm (k8s production)
- Ship with realistic demo data for immediate evaluation

## Capabilities

### New Capabilities

- `architecture`: System architecture — monorepo structure, package boundaries, database schema, deployment topology, infrastructure components (PostgreSQL, Redis, Docker, Helm), and inter-package communication patterns
- `quality-score`: KPI calculation engine — the five core metrics (cycle time, defect escape rate, architectural drift, MTTRC, rework %), composite health scoring, threshold classification, and shift tracking logic
- `frontend`: React dashboard — layout, KPI cards, charts (trend, comparison, radar, breakdown), insight panels, team views, settings page, onboarding wizard, responsive design, and dark theme
- `plans`: Implementation phasing — four-phase rollout (Foundation, Dashboard, Intelligence, Architecture+Polish), task breakdown per phase, dependency ordering, and demo mode strategy
- `product-sense`: Product definition — the five KPIs and why they matter, insight generation engine (correlation, anomaly, hotspot detection), configuration model, connector abstraction, API surface, and non-goals
- `security`: Security model — API key authentication for collectors, optional OAuth for dashboard, rate limiting, environment variable handling for secrets, input validation, and CI security scanning (CodeQL)

### Modified Capabilities

(None — greenfield project, no existing specs to modify)

## Impact

- **New codebase**: Full monorepo under `packages/` (core, connectors, server, dashboard)
- **Infrastructure dependencies**: PostgreSQL 16, Redis, Node.js 20+
- **External integrations**: GitHub API, Jira API, PagerDuty API, OpsGenie API, CI/CD systems
- **Deployment artifacts**: Docker images (server + dashboard), Helm chart, nginx config
- **CI/CD**: GitHub Actions workflows for lint/test/build, releases, and security scanning
- **License**: Apache 2.0

# Implementation Plans

## Overview

DevPulse is built in four phases, each delivering incremental value. The implementation follows a monorepo structure with four packages (`core`, `connectors`, `server`, `dashboard`) using pnpm workspaces.

## Phase 1: Foundation

**Goal**: Core engine + GitHub connector working with demo data.

### Deliverables
- [x] pnpm monorepo with workspace packages
- [x] Core package: types, KPI calculation engine, threshold logic, health scoring
- [x] Utility functions: statistics (median, percentile, Pearson correlation), time helpers, threshold classification
- [x] PostgreSQL schema with 8 tables (teams, kpi_snapshots, pr_events, defects, incidents, arch_violations, insights, thresholds)
- [x] Database migrations (001–008) using raw SQL
- [x] GitHub connector: PR lifecycle extraction with pagination
- [x] Rework detector: file churn analysis with 21-day window
- [x] Commit classifier: conventional commit parsing + heuristic fallback
- [x] PR analyzer: enriches PRs with review, commit, deployment timestamps
- [x] Express API server: routes for KPIs, trends, health, teams, insights, config, comparisons, collection
- [x] Server middleware: API key auth, error handler, rate limiter
- [x] Server services: KPI, trend, insight, comparison
- [x] BullMQ jobs: collection scheduler, KPI calculator, shift calculator
- [x] Docker Compose: server + postgres + redis + dashboard
- [x] Dockerfiles: multi-stage builds for server (Node) and dashboard (nginx)
- [x] Demo data: 4 teams, 6 months KPI snapshots, PR events, defects, incidents, insights
- [x] Unit tests: all 5 KPI calculators, health score, shift tracker, statistics utilities
- [x] CI: GitHub Actions (lint, typecheck, test, build)

### Architecture Decisions
- **Vanilla PostgreSQL** over ORM for performance and transparency
- **BullMQ + Redis** for reliable async job processing
- **TypeScript strict mode** across all packages
- **ESLint + Prettier** with single quotes, semicolons, trailing commas

## Phase 2: Dashboard

**Goal**: React dashboard with overview, trends, and team comparison.

### Deliverables
- [x] Vite + React + TypeScript scaffold with TailwindCSS
- [x] Responsive layout with sidebar navigation (desktop: fixed, mobile: hamburger)
- [x] KPI card component with health badge and shift indicator
- [x] 5-card responsive grid layout
- [x] Health radar chart (Recharts RadarChart)
- [x] Trend chart with threshold band overlays (AreaChart)
- [x] Cycle time breakdown (stacked BarChart for 4 phases)
- [x] Rework breakdown (donut PieChart by cause)
- [x] Team comparison bar chart (color-coded by health tier)
- [x] Sortable team table with KPI columns
- [x] Incident table with severity badges and MTTRC values
- [x] API client layer with Axios interceptors
- [x] Data hooks: useKpiData, useHealthScore, useShiftTracking, useAutoRefresh
- [x] Utility modules: colors (tier/KPI/severity palettes), formatters
- [x] Dark-first theme (slate-900 background)
- [x] Overview page: composite health + radar + KPI grid + insights
- [x] Trends page: time range selector, KPI switcher, charts
- [x] Teams page: comparison chart + sortable table + incident table

## Phase 3: Intelligence

**Goal**: Automated insight generation — the differentiating feature.

### Deliverables
- [x] Insight generator BullMQ job (daily orchestration)
- [x] Correlation detection: Pearson r across KPI pairs (|r| > 0.7, min 30 data points)
- [x] Anomaly detection: rolling 30-day mean + 2σ threshold (critical > 3σ, warning > 2σ)
- [x] Hotspot detection: team outlier identification (> org avg + 10pp)
- [x] Insight cards on dashboard (severity-coded: info, warning, critical)
- [x] Insight dismissal support
- [x] Jira connector: issue lifecycle + defect classification
- [x] Defect classifier: label/summary/component pattern matching with confidence scores
- [x] PagerDuty connector: incident timeline extraction
- [x] OpsGenie connector: alert ingestion with severity mapping
- [x] Incident analyzer: MTTR, MTTRC, MTTA calculation + recurrence detection
- [x] CI connectors: GitHub Actions + Jenkins build analysis
- [x] Build analyzer: success rate, flaky pipeline detection, duration percentiles

## Phase 4: Architecture + Polish

**Goal**: Architectural drift measurement + production readiness.

### Deliverables
- [x] ArchUnit report parser connector (JSON + text formats)
- [x] Dependency analyzer: cycle detection (DFS), hotspot analysis, drift scoring
- [x] Fitness function connector: CI fitness function result parsing
- [x] Settings page: threshold configuration UI with validation
- [x] Onboarding wizard: 3-step team + connector setup
- [x] Error handling UI: ErrorBanner, Toast components
- [x] Helm chart for Kubernetes deployment (server, dashboard, PostgreSQL, Redis, ingress)
- [x] Playwright e2e tests for all 5 pages
- [x] Full documentation: README, getting-started, KPI definitions, connector guide, API reference, deployment, architecture
- [x] GitHub repo setup: issue templates, PR template, CODEOWNERS
- [x] Example connector: custom connector template with usage documentation
- [x] CodeQL security scanning workflow
- [x] Release workflow: Docker image publish to GHCR

## Deployment Strategy

### Development
```bash
docker-compose up
# PostgreSQL 16, Redis 7, API (port 4000), Dashboard (port 3000)
```

### Production (Kubernetes)
```bash
helm install devpulse ./deploy/helm/devpulse \
  --set ingress.enabled=true \
  --set ingress.host=devpulse.example.com
```

### Bare Metal
```bash
pnpm install && pnpm build
export DATABASE_URL=postgresql://...
export REDIS_URL=redis://...
node packages/server/dist/index.js
# Serve dashboard/dist with nginx
```

## Future Roadmap

### Planned Enhancements
- OAuth integration for dashboard authentication
- Custom KPI support (user-defined metrics)
- Slack/Teams notifications for insight alerts
- GitLab and Bitbucket connectors
- Azure DevOps connector
- Configurable KPI weights for composite score
- Historical comparison reports (quarter-over-quarter)
- CSV/PDF export for executive reporting
- Multi-org support
- SSO integration (SAML, OIDC)

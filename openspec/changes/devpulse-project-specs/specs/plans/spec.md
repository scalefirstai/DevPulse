## ADDED Requirements

### Requirement: Phase 1 — Foundation (Weeks 1-2)
Phase 1 SHALL deliver the monorepo setup, core package with types and KPI engine, PostgreSQL schema with migrations, seed data for 4 teams over 6 months, GitHub connector with PR lifecycle extraction and rework detection, cycle time calculator, Express API with /api/kpis, /api/trends, and /api/health endpoints, Docker Compose configuration, and basic CI (lint + test on PR).

#### Scenario: Phase 1 completion gate
- **WHEN** all Phase 1 tasks are complete
- **THEN** running `docker-compose up` starts the server with demo data and the API returns KPI values at `GET /api/kpis/:teamSlug`

#### Scenario: Core package usability
- **WHEN** Phase 1 is complete
- **THEN** the `@devpulse/core` package exports all KPI types, threshold logic, and the health score calculator, and is importable by other workspace packages

### Requirement: Phase 2 — Dashboard (Weeks 3-4)
Phase 2 SHALL deliver the React dashboard with Vite + TailwindCSS scaffold, KPI card component with health badges and shift indicators, 5-card grid overview page, health radar chart, trend chart with threshold bands, team comparison table and bar chart, API client hooks, dark theme, responsive layout, and onboarding wizard.

#### Scenario: Phase 2 completion gate
- **WHEN** all Phase 2 tasks are complete
- **THEN** navigating to `http://localhost:3000` displays the overview page with all 5 KPI cards populated from the API, a radar chart, and an insights panel

#### Scenario: Mobile accessibility
- **WHEN** Phase 2 is complete
- **THEN** the dashboard renders correctly on viewports from 375px (mobile) to 2560px (ultrawide)

### Requirement: Phase 3 — Intelligence (Weeks 5-6)
Phase 3 SHALL deliver the insight generation engine (BullMQ scheduled job), correlation detection (Pearson across KPI pairs), anomaly detection (rolling mean + 2-sigma), hotspot detection (team outlier identification), shift tracker with direction and velocity, insight cards on the dashboard, Jira connector with issue lifecycle and defect classification, defect escape rate calculator, PagerDuty connector with incident timeline extraction, and MTTRC calculator.

#### Scenario: Phase 3 completion gate
- **WHEN** all Phase 3 tasks are complete
- **THEN** the insight generation job runs on schedule and the dashboard displays auto-generated insight cards with severity coloring

#### Scenario: Multi-connector operation
- **WHEN** Phase 3 is complete
- **THEN** data collection supports GitHub, Jira, and PagerDuty connectors running concurrently via BullMQ queues

### Requirement: Phase 4 — Architecture and polish (Weeks 7-8)
Phase 4 SHALL deliver the ArchUnit report parser connector, dependency analyzer for static analysis, architectural drift calculator, CI fitness function results connector, Settings page with threshold configuration UI, API key auth middleware, Helm chart for k8s deployment, Playwright e2e tests, documentation (README, getting-started, KPI definitions, connector guide, API reference, deployment guide, architecture docs), demo mode with one-command startup, and GitHub repo setup (issue templates, PR template, CODEOWNERS).

#### Scenario: Phase 4 completion gate
- **WHEN** all Phase 4 tasks are complete
- **THEN** all five KPIs are computed from their respective data sources, the Settings page allows threshold editing, and `helm install` deploys the full stack to Kubernetes

#### Scenario: Documentation completeness
- **WHEN** Phase 4 is complete
- **THEN** the `docs/` directory contains getting-started.md, kpi-definitions.md, connector-guide.md, api-reference.md, deployment.md, and architecture.md

### Requirement: Demo mode with seed data
The system SHALL include a demo mode that starts with `docker-compose up` and no configuration. Demo data SHALL include 4 teams (Platform, Payments, Identity, Data Engineering), 6 months of timeseries KPI data with realistic variance, pre-generated insights showing correlations, mixed health levels across teams, at least one team with a rework hotspot, at least one team with improving cycle time trend, and a recent P1 incident with full MTTRC tracking.

#### Scenario: Demo startup
- **WHEN** a new user clones the repo and runs `docker-compose up`
- **THEN** the system starts within 60 seconds and the dashboard shows data for all 4 demo teams

#### Scenario: Realistic data variance
- **WHEN** demo data is viewed on the trend chart
- **THEN** values show natural variance (not uniform), visible trends, and at least one anomaly spike

### Requirement: Phase dependency ordering
Phases SHALL be executed sequentially: Phase 1 before Phase 2, Phase 2 before Phase 3, Phase 3 before Phase 4. Within each phase, independent tasks MAY be executed in parallel. Cross-phase dependencies SHALL be: Dashboard (Phase 2) requires API endpoints from Phase 1; Intelligence (Phase 3) requires dashboard components from Phase 2 for insight display; Architecture (Phase 4) requires the insight engine from Phase 3 for arch drift insights.

#### Scenario: Cross-phase dependency
- **WHEN** a developer attempts to build the trend chart (Phase 2)
- **THEN** the /api/trends endpoint from Phase 1 is available to provide data

#### Scenario: Intra-phase parallelism
- **WHEN** working on Phase 1
- **THEN** GitHub connector development and database migration development can proceed in parallel

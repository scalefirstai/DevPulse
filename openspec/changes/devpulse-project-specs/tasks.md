## 1. Monorepo Setup

- [x] 1.1 Initialize pnpm workspace with `pnpm-workspace.yaml` defining packages/* as workspace packages
- [x] 1.2 Create root `package.json` with workspace scripts (build, test, lint) and shared dev dependencies (TypeScript, ESLint, Prettier)
- [x] 1.3 Create root `tsconfig.json` base configuration with strict mode, ES2022 target, and path aliases for `@devpulse/*`
- [x] 1.4 Scaffold `packages/core/` with package.json (`@devpulse/core`), tsconfig.json extending root, and src/index.ts entry point
- [x] 1.5 Scaffold `packages/connectors/` with package.json (`@devpulse/connectors`), tsconfig.json, dependency on `@devpulse/core`
- [x] 1.6 Scaffold `packages/server/` with package.json (`@devpulse/server`), tsconfig.json, dependencies on `@devpulse/core` and `@devpulse/connectors`
- [x] 1.7 Scaffold `packages/dashboard/` with Vite + React + TypeScript template, dependency on `@devpulse/core`
- [x] 1.8 Add ESLint config with TypeScript rules and Prettier integration
- [x] 1.9 Verify cross-package imports work (`@devpulse/core` importable from server and dashboard)

## 2. Core Package — Types

- [x] 2.1 Define KPI types in `packages/core/src/types/kpi.ts`: CycleTimeRecord, DefectRecord, ArchDriftRecord, MttrcRecord, ReworkRecord, KpiSnapshot, HealthLevel enum (elite/strong/moderate/alert)
- [x] 2.2 Define config types in `packages/core/src/types/config.ts`: ThresholdConfig, TeamConfig, OrgConfig, ConnectorConfig
- [x] 2.3 Define connector interface in `packages/core/src/types/connectors.ts`: BaseConnectorInterface with collect(), transform(), validate() methods
- [x] 2.4 Create barrel export `packages/core/src/types/index.ts` re-exporting all types

## 3. Core Package — KPI Calculation Engine

- [x] 3.1 Implement `packages/core/src/utils/statistics.ts`: median, mean, percentile, standardDeviation, pearsonCorrelation, movingAverage functions
- [x] 3.2 Implement `packages/core/src/utils/thresholds.ts`: classifyHealthLevel function mapping a value + KPI type to Elite/Strong/Moderate/Alert
- [x] 3.3 Implement `packages/core/src/utils/time.ts`: date range utilities, period boundary calculation, duration formatting
- [x] 3.4 Implement `packages/core/src/engine/cycle-time.ts`: calculate median cycle time from PR events with 4-phase breakdown (ideation, coding, review, deploy)
- [x] 3.5 Implement `packages/core/src/engine/defect-escape.ts`: calculate escape rate percentage with severity-weighted variant and category breakdown
- [x] 3.6 Implement `packages/core/src/engine/arch-drift.ts`: calculate drift percentage and velocity (accelerating/decelerating/stable)
- [x] 3.7 Implement `packages/core/src/engine/mttrc.ts`: calculate median MTTRC in hours with unknown-root-cause percentage and method breakdown
- [x] 3.8 Implement `packages/core/src/engine/rework.ts`: calculate rework percentage with configurable window (default 21 days) and reason breakdown
- [x] 3.9 Implement `packages/core/src/engine/health-score.ts`: compute composite 0-100 score from 5 KPI tier classifications
- [x] 3.10 Implement `packages/core/src/engine/shift-tracker.ts`: compute shift percentage, direction (improving/declining/flat), and velocity (accelerating/decelerating/stable) from 3-period moving average

## 4. Core Package — Tests

- [x] 4.1 Write tests for cycle-time calculator: median calculation, phase breakdown, missing issue linkage fallback
- [x] 4.2 Write tests for defect-escape calculator: basic rate, severity breakdown, zero-defect edge case
- [x] 4.3 Write tests for arch-drift calculator: drift percentage, velocity classification, no-rules edge case
- [x] 4.4 Write tests for mttrc calculator: median calculation, unknown root cause handling, method breakdown
- [x] 4.5 Write tests for rework calculator: basic percentage, configurable window, reason breakdown
- [x] 4.6 Write tests for health-score: composite scoring, tier classification with default thresholds, custom thresholds
- [x] 4.7 Write tests for shift-tracker: improving/declining/flat direction, accelerating/decelerating/stable velocity
- [x] 4.8 Write tests for statistics utilities: median, percentile, pearsonCorrelation, movingAverage

## 5. Database Schema and Migrations

- [x] 5.1 Add `node-pg-migrate` dependency to server package and configure migration directory at `packages/server/src/db/migrations/`
- [x] 5.2 Create migration 001_create_teams: teams table with id (UUID), name, slug (unique), metadata (JSONB), created_at
- [x] 5.3 Create migration 002_create_kpi_snapshots: kpi_snapshots table with composite unique constraint and descending index on (team_id, kpi_type, period_end)
- [x] 5.4 Create migration 003_create_incidents: incidents table with severity, detection/mitigation/root-cause/resolution timestamps, recurrence tracking
- [x] 5.5 Create migration 004_create_defects: defects table with severity, found_in, escaped boolean, category
- [x] 5.6 Create migration 005_create_pr_events: pr_events table with full PR lifecycle timestamps, is_rework flag, rework_reason
- [x] 5.7 Create migration 006_create_arch_violations: arch_violations table with rule_name, violation_type, source/target components, scan_source
- [x] 5.8 Create migration 007_create_insights: insights table with insight_type, severity, kpis_involved array, dismissed_at
- [x] 5.9 Create migration 008_create_thresholds: thresholds table with per-KPI tier boundaries, seed default threshold values
- [x] 5.10 Implement auto-migration on server startup (run pending migrations before HTTP server starts)

## 6. Server — Configuration and Infrastructure

- [x] 6.1 Implement `packages/server/src/config/env.ts`: validate required environment variables (DATABASE_URL, REDIS_URL) at startup, fail fast with descriptive errors
- [x] 6.2 Implement `packages/server/src/config/database.ts`: PostgreSQL connection pool using pg, expose query helper
- [x] 6.3 Implement `packages/server/src/config/redis.ts`: Redis connection for BullMQ, connection health check
- [x] 6.4 Implement YAML config loader: parse `devpulse.config.yaml` with `${ENV_VAR}` substitution, fall back to demo defaults if file missing
- [x] 6.5 Set up BullMQ queues: data-collection, kpi-calculation, insight-generation, shift-calculation with configurable concurrency and retry policies

## 7. Server — API Routes

- [x] 7.1 Set up Express app in `packages/server/src/index.ts` with JSON body parser, CORS, and error handler middleware
- [x] 7.2 Implement `GET /api/health` route: return composite org health score (0-100)
- [x] 7.3 Implement `GET /api/kpis/:teamSlug` route: return all 5 current KPI values with health_level and shift data
- [x] 7.4 Implement `GET /api/kpis/:teamSlug/:kpiType` route: return single KPI detail with breakdown data
- [x] 7.5 Implement `GET /api/trends/:kpiType?range=90d` route: return timeseries array for charting
- [x] 7.6 Implement `GET /api/compare?teams=a,b,c&kpi=all` route: return cross-team KPI comparison
- [x] 7.7 Implement `GET /api/insights?severity=warning` route: return filtered auto-generated insights
- [x] 7.8 Implement `GET /api/shifts/:teamSlug` route: return direction + velocity for all KPIs
- [x] 7.9 Implement `GET /api/config/thresholds` and `PUT /api/config/thresholds` routes
- [x] 7.10 Implement `POST /api/collect/trigger` and `GET /api/collect/status` routes
- [x] 7.11 Implement CRUD routes: `GET/POST /api/teams`, `PUT/DELETE /api/teams/:id`

## 8. Server — Services

- [x] 8.1 Implement `kpi-service.ts`: query kpi_snapshots for team, compute health level using thresholds, return formatted KPI data
- [x] 8.2 Implement `trend-service.ts`: query kpi_snapshots timeseries by date range, return sorted array
- [x] 8.3 Implement `comparison-service.ts`: query latest snapshots across multiple teams, return comparison data
- [x] 8.4 Implement `insight-service.ts`: query insights table with severity filtering, handle dismissal

## 9. Server — Middleware and Security

- [x] 9.1 Implement `auth.ts` middleware: validate X-API-Key header against hashed keys using constant-time comparison
- [x] 9.2 Implement `rate-limiter.ts` middleware: per-IP rate limiting (100/min read, 20/min write, 5/min collection) with 429 response and Retry-After header
- [x] 9.3 Implement `error-handler.ts` middleware: catch unhandled errors, return consistent JSON error responses, redact secrets from logs
- [x] 9.4 Implement input validation middleware: path parameter format validation (slugs, UUIDs), query parameter validation (range format), request body JSON schema validation
- [x] 9.5 Configure CORS: restrict origins to dashboard URL in production, allow localhost:3000 and localhost:5173 in development
- [x] 9.6 Add secure HTTP headers: X-Content-Type-Options, X-Frame-Options, Content-Security-Policy, conditional HSTS

## 10. Connectors — Base and GitHub

- [x] 10.1 Implement `packages/connectors/src/base-connector.ts`: abstract class with collect(), transform(), validate() interface, built-in retry with exponential backoff, rate limit handling (X-RateLimit-Remaining), pagination support, structured error logging
- [x] 10.2 Implement `packages/connectors/src/github/github-connector.ts`: authenticate with GitHub API, fetch PRs for configured repos
- [x] 10.3 Implement `packages/connectors/src/github/pr-analyzer.ts`: extract PR lifecycle timestamps (created, first_commit, first_review, approved, merged, deployed)
- [x] 10.4 Implement `packages/connectors/src/github/rework-detector.ts`: detect file churn within configurable window, classify rework reasons
- [x] 10.5 Implement `packages/connectors/src/github/commit-classifier.ts`: classify commits as feature, fix, refactor, or rework
- [x] 10.6 Write tests for GitHub connector with recorded API fixtures

## 11. Server — Jobs

- [x] 11.1 Implement `collection-scheduler.ts`: cron-based job that enqueues data collection for each enabled connector
- [x] 11.2 Implement `kpi-calculator.ts`: job that runs KPI calculations across all teams and writes kpi_snapshots
- [x] 11.3 Implement `shift-calculator.ts`: job that computes shift direction and velocity for each team's KPIs

## 12. Demo Data and Docker Compose

- [x] 12.1 Create `packages/server/src/db/seed/demo-data.sql`: 4 teams (Platform, Payments, Identity, Data Engineering), 6 months of kpi_snapshots with realistic variance
- [x] 12.2 Add demo PR events, defects, incidents, and arch violations with varied health levels across teams
- [x] 12.3 Include a rework hotspot for one team, improving cycle time trend for another, and a recent P1 incident with MTTRC tracking
- [x] 12.4 Add pre-generated demo insights (correlations, anomalies, hotspots)
- [x] 12.5 Create `Dockerfile.server` with multi-stage build (build TypeScript, run node)
- [x] 12.6 Create `Dockerfile.dashboard` with multi-stage build (build Vite, serve with nginx)
- [x] 12.7 Create `nginx.conf` for dashboard serving with API proxy
- [x] 12.8 Create `docker-compose.yml` orchestrating server, dashboard, postgres, redis with health check dependencies
- [x] 12.9 Wire demo mode: auto-seed data when no config file present, verify `docker-compose up` starts within 60 seconds

## 13. CI/CD

- [x] 13.1 Create `.github/workflows/ci.yml`: lint, type-check, and test all packages on PR
- [x] 13.2 Create `.github/workflows/release.yml`: semantic versioning, Docker image build and push on merge to main
- [x] 13.3 Create `.github/workflows/codeql.yml`: CodeQL security scanning on PR and weekly schedule, block merge on high/critical findings

## 14. Dashboard — Scaffold and Layout

- [x] 14.1 Configure Vite + React 18 + TypeScript in `packages/dashboard/`
- [x] 14.2 Install and configure TailwindCSS with dark theme as default
- [x] 14.3 Install Recharts and React Router
- [x] 14.4 Implement `Layout.tsx` with sidebar navigation (Overview, Trends, Teams, Settings) and top header with org name and last-updated timestamp
- [x] 14.5 Implement responsive sidebar: visible on desktop (>=1280px), collapsible hamburger menu on mobile (<768px)
- [x] 14.6 Set up React Router with routes for Overview, Trends, Teams, Settings, and Onboarding pages

## 15. Dashboard — API Client and Hooks

- [x] 15.1 Implement `api/client.ts`: Axios instance with base URL config, auth token interceptor, error response interceptor
- [x] 15.2 Implement `api/kpis.ts`: fetchKpis(teamSlug), fetchKpiDetail(teamSlug, kpiType) functions
- [x] 15.3 Implement `api/teams.ts`: fetchTeams(), createTeam(), updateTeam(), deleteTeam() functions
- [x] 15.4 Implement `api/trends.ts`: fetchTrends(kpiType, range) function
- [x] 15.5 Implement `api/insights.ts`: fetchInsights(severity?), dismissInsight(id) functions
- [x] 15.6 Implement `hooks/useKpiData.ts`: React hook wrapping KPI API calls with loading/error state
- [x] 15.7 Implement `hooks/useHealthScore.ts`: React hook for composite health score
- [x] 15.8 Implement `hooks/useShiftTracking.ts`: React hook for shift direction and velocity data
- [x] 15.9 Implement `hooks/useAutoRefresh.ts`: configurable interval auto-refresh hook (default 300s) with manual refresh trigger

## 16. Dashboard — Common Components

- [x] 16.1 Implement `HealthBadge.tsx`: colored badge (green/blue/yellow/red) for Elite/Strong/Moderate/Alert
- [x] 16.2 Implement `ShiftIndicator.tsx`: arrow up/down/flat with shift percentage and color
- [x] 16.3 Implement `ThresholdBar.tsx`: horizontal bar showing value position relative to tier boundaries
- [x] 16.4 Implement `Tooltip.tsx`: reusable tooltip component
- [x] 16.5 Implement `EmptyState.tsx`: placeholder component for no-data scenarios
- [x] 16.6 Implement `utils/colors.ts`: KPI color scheme constants, tier colors
- [x] 16.7 Implement `utils/formatters.ts`: number formatting (decimals, percentages), date formatting, duration formatting

## 17. Dashboard — KPI Cards and Overview Page

- [x] 17.1 Implement `KpiCard.tsx`: card with KPI name, current value + unit, HealthBadge, ShiftIndicator
- [x] 17.2 Implement `KpiGrid.tsx`: responsive 5-card grid (single row desktop, 3+2 tablet, stacked mobile)
- [x] 17.3 Implement `HealthRadar.tsx`: Recharts RadarChart with 5 axes (one per KPI), normalized 0-100 scale, threshold bands as concentric fills
- [x] 17.4 Implement `InsightCard.tsx`: card with title, description, severity badge (info blue/warning yellow/critical red), KPI tags, dismiss button
- [x] 17.5 Implement `InsightGrid.tsx`: panel displaying insight cards, filtered by severity
- [x] 17.6 Assemble `Overview.tsx` page: KpiGrid + HealthRadar + InsightGrid, team selector dropdown

## 18. Dashboard — Trends and Team Pages

- [x] 18.1 Implement `TrendChart.tsx`: Recharts AreaChart with timeseries data, threshold bands as colored background regions, configurable date range
- [x] 18.2 Implement `CycleTimeBreakdown.tsx`: stacked bar chart showing ideation/coding/review/deploy phases per period
- [x] 18.3 Implement `ReworkPie.tsx`: pie chart showing rework breakdown by cause (bug_fix, requirement_change, refactor, scope_creep)
- [x] 18.4 Assemble `Trends.tsx` page: KPI selector, range selector (30d/60d/90d), TrendChart, conditional breakdown chart (CycleTimeBreakdown or ReworkPie)
- [x] 18.5 Implement `ComparisonBar.tsx`: horizontal bar chart comparing selected KPI across teams, bars colored by health tier, sorted by value
- [x] 18.6 Implement `TeamTable.tsx`: sortable data table with columns for team name + each KPI (value + health badge)
- [x] 18.7 Implement `IncidentTable.tsx`: table of recent incidents with severity, MTTRC, root cause method
- [x] 18.8 Assemble `Teams.tsx` page: KPI selector, ComparisonBar + TeamTable + IncidentTable

## 19. Dashboard — Settings and Onboarding

- [x] 19.1 Implement `Settings.tsx` page: editable threshold form for all 5 KPIs (elite_max, strong_max, moderate_max), validation (elite < strong < moderate), save via PUT /api/config/thresholds
- [x] 19.2 Implement `Onboarding.tsx` page: multi-step wizard (create team → configure connector → trigger collection), redirect to Overview on completion
- [x] 19.3 Implement first-run detection: redirect to Onboarding when API returns zero teams
- [x] 19.4 Implement network error banner: persistent "Unable to connect to the server" banner on API unreachability
- [x] 19.5 Implement toast notifications for API errors and success confirmations

## 20. Connectors — Jira, PagerDuty, and CI

- [x] 20.1 Implement `packages/connectors/src/jira/jira-connector.ts`: authenticate with Jira API, fetch issues for configured projects
- [x] 20.2 Implement `packages/connectors/src/jira/issue-lifecycle.ts`: extract issue created → resolved → deployed timeline
- [x] 20.3 Implement `packages/connectors/src/jira/defect-classifier.ts`: classify defect found_in stage and category
- [x] 20.4 Write tests for Jira connector with recorded API fixtures
- [x] 20.5 Implement `packages/connectors/src/incidents/pagerduty-connector.ts`: authenticate with PagerDuty API, fetch incidents
- [x] 20.6 Implement `packages/connectors/src/incidents/opsgenie-connector.ts`: authenticate with OpsGenie API, fetch incidents
- [x] 20.7 Implement `packages/connectors/src/incidents/incident-analyzer.ts`: extract incident → root cause timeline, compute MTTRC
- [x] 20.8 Write tests for PagerDuty and OpsGenie connectors with recorded fixtures
- [x] 20.9 Implement `packages/connectors/src/ci/github-actions-connector.ts`: fetch workflow runs and extract build → deploy timing
- [x] 20.10 Implement `packages/connectors/src/ci/jenkins-connector.ts`: fetch build records and extract timing
- [x] 20.11 Implement `packages/connectors/src/ci/build-analyzer.ts`: calculate build-to-deploy phase duration
- [x] 20.12 Write tests for CI connectors

## 21. Insight Generation Engine

- [x] 21.1 Implement `packages/server/src/jobs/insight-generator.ts`: BullMQ job that runs daily, orchestrates all detection mechanisms
- [x] 21.2 Implement correlation detection: compute Pearson r across all KPI pairs over 90 days, generate insight if |r| > 0.7 with minimum 30 data points
- [x] 21.3 Implement anomaly detection: compute rolling 30-day mean and stddev per team per KPI, generate critical insight if value > mean + 2σ
- [x] 21.4 Implement hotspot detection: compare each team's metric to org-wide average, generate warning if team > org + 10 percentage points
- [x] 21.5 Write tests for insight generator: correlation detection, anomaly detection, hotspot detection, minimum sample size enforcement

## 22. Architecture Connectors and Drift

- [x] 22.1 Implement `packages/connectors/src/architecture/archunit-connector.ts`: parse ArchUnit/jDepend CI report files
- [x] 22.2 Implement `packages/connectors/src/architecture/dependency-analyzer.ts`: static dependency graph analysis for drift detection
- [x] 22.3 Implement `packages/connectors/src/architecture/fitness-function-connector.ts`: parse CI fitness function results
- [x] 22.4 Write tests for architecture connectors

## 23. Deployment — Helm Chart

- [x] 23.1 Create `deploy/helm/devpulse/Chart.yaml` and `values.yaml` with configurable resource limits, replica counts, image tags
- [x] 23.2 Create server deployment template with environment variable injection, health/readiness probes
- [x] 23.3 Create dashboard deployment template with nginx, health probe
- [x] 23.4 Create PostgreSQL StatefulSet template with persistent volume claim
- [x] 23.5 Create Redis deployment template
- [x] 23.6 Create ingress template with configurable host and TLS
- [x] 23.7 Validate Helm chart with `helm lint` and `helm template`

## 24. End-to-End Tests

- [x] 24.1 Set up Playwright configuration in `packages/dashboard/`
- [x] 24.2 Write e2e test: Overview page loads with KPI cards and radar chart
- [x] 24.3 Write e2e test: Trends page renders chart with range selector
- [x] 24.4 Write e2e test: Teams page shows comparison table and bar chart
- [x] 24.5 Write e2e test: Settings page saves threshold changes
- [x] 24.6 Write e2e test: Onboarding wizard completes setup flow

## 25. Documentation and Repository Setup

- [x] 25.1 Write `README.md` with project overview, 5 KPIs description, quick start (docker-compose up), connect-your-data instructions, and doc links
- [x] 25.2 Write `docs/getting-started.md`: prerequisites, installation, first run, configuration
- [x] 25.3 Write `docs/kpi-definitions.md`: detailed specs for each KPI with formulas and threshold defaults
- [x] 25.4 Write `docs/connector-guide.md`: how to write a custom connector extending BaseConnector
- [x] 25.5 Write `docs/api-reference.md`: all REST endpoints with request/response examples
- [x] 25.6 Write `docs/deployment.md`: Docker Compose, Kubernetes/Helm, bare metal instructions
- [x] 25.7 Write `docs/architecture.md`: system design decisions, package structure, data flow
- [x] 25.8 Create `CONTRIBUTING.md` with dev setup, coding standards, PR process
- [x] 25.9 Create `LICENSE` file (Apache 2.0)
- [x] 25.10 Create GitHub issue templates, PR template, and CODEOWNERS file
- [x] 25.11 Create `devpulse.config.example.yaml` and `examples/custom-connector/example-connector.ts`

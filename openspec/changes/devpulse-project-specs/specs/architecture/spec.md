## ADDED Requirements

### Requirement: Monorepo package structure
The system SHALL be organized as a pnpm monorepo with four packages: `core` (shared types and KPI engine), `connectors` (data source integrations), `server` (Express API backend), and `dashboard` (React frontend). Each package SHALL have its own `package.json`, `tsconfig.json`, and test configuration. The `core` package SHALL be a dependency of all other packages.

#### Scenario: Package dependency resolution
- **WHEN** any package imports from `@devpulse/core`
- **THEN** TypeScript resolves the shared types without requiring a separate publish step

#### Scenario: Independent package builds
- **WHEN** a developer runs the build command for a single package
- **THEN** only that package and its workspace dependencies are compiled

### Requirement: PostgreSQL database schema
The system SHALL use PostgreSQL 16 with the following tables: `teams`, `kpi_snapshots`, `pr_events`, `defects`, `incidents`, `arch_violations`, `insights`, and `thresholds`. The `kpi_snapshots` table SHALL have a composite unique constraint on `(team_id, kpi_type, period_end)` and a composite index on `(team_id, kpi_type, period_end DESC)` for efficient timeseries range queries.

#### Scenario: KPI snapshot uniqueness
- **WHEN** a KPI calculator attempts to insert a snapshot with the same team_id, kpi_type, and period_end as an existing row
- **THEN** the database rejects the insert with a unique constraint violation

#### Scenario: Timeseries range query performance
- **WHEN** querying kpi_snapshots for a specific team and KPI type over a 90-day range
- **THEN** the query uses the composite index and returns results without a sequential scan

### Requirement: Database migrations
The system SHALL use `node-pg-migrate` for SQL-based schema migrations. Migrations SHALL run automatically on server startup and SHALL be idempotent. All migrations through minor versions SHALL be additive (no destructive DDL).

#### Scenario: Automatic migration on startup
- **WHEN** the server process starts
- **THEN** all pending migrations are applied before the HTTP server begins accepting requests

#### Scenario: Idempotent migration execution
- **WHEN** migrations are run against a database that is already up to date
- **THEN** no changes are made and the server starts normally

### Requirement: BullMQ job processing infrastructure
The system SHALL use BullMQ backed by Redis for asynchronous job processing. The job system SHALL support cron-based scheduling, retry with exponential backoff, configurable concurrency per queue, and job progress tracking. Queues SHALL include: `data-collection`, `kpi-calculation`, `insight-generation`, and `shift-calculation`.

#### Scenario: Scheduled data collection
- **WHEN** the configured cron schedule triggers (default: daily at 2am)
- **THEN** data collection jobs are enqueued for each configured connector

#### Scenario: Job retry on failure
- **WHEN** a job fails due to a transient error (network timeout, rate limit)
- **THEN** the job is retried with exponential backoff up to the configured maximum attempts

### Requirement: Docker Compose local development
The system SHALL provide a `docker-compose.yml` that orchestrates the server, dashboard, PostgreSQL, and Redis containers. Running `docker-compose up` with no additional configuration SHALL start the system with demo data.

#### Scenario: Zero-config startup
- **WHEN** a user runs `docker-compose up` with no environment variables or config files
- **THEN** all four services start, migrations run, demo data is seeded, and the dashboard is accessible at `http://localhost:3000`

#### Scenario: Service health dependencies
- **WHEN** Docker Compose starts the services
- **THEN** the server waits for PostgreSQL and Redis to be healthy before starting

### Requirement: Helm chart for Kubernetes deployment
The system SHALL provide a Helm chart under `deploy/helm/devpulse/` with templates for server deployment, dashboard deployment, PostgreSQL StatefulSet, Redis deployment, and ingress. The chart SHALL support configurable resource limits, replica counts, and environment-specific values via `values.yaml`.

#### Scenario: Production deployment with custom values
- **WHEN** an operator runs `helm install devpulse ./deploy/helm/devpulse -f production-values.yaml`
- **THEN** all components are deployed with the specified resource limits, replica counts, and configuration

#### Scenario: Helm rollback
- **WHEN** an operator runs `helm rollback devpulse`
- **THEN** all deployments revert to the previous revision while the database retains its data (additive migrations are forward-compatible)

### Requirement: CI/CD with GitHub Actions
The system SHALL include three GitHub Actions workflows: `ci.yml` (lint, test, build on every PR), `release.yml` (semantic versioning and Docker image publishing on merge to main), and `codeql.yml` (security scanning). The CI workflow SHALL run tests for all four packages.

#### Scenario: PR validation
- **WHEN** a pull request is opened or updated
- **THEN** the CI workflow runs linting, type checking, and tests across all packages and reports pass/fail status

#### Scenario: Release publishing
- **WHEN** a commit is merged to main with a version bump
- **THEN** Docker images for server and dashboard are built, tagged with the version, and pushed to the container registry

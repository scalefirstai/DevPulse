## Context

DevPulse is a greenfield open-source engineering health framework. There is no existing codebase — the project starts from an empty repository. The target users are CXOs and engineering leaders who need outcome-oriented metrics instead of vanity metrics like velocity or story points.

The system has two main surfaces: a data collection backend that pulls from external tools (GitHub, Jira, PagerDuty, CI/CD) and computes five KPIs, and a React dashboard that visualizes trends, comparisons, and auto-generated insights. The project must be easy to evaluate (demo mode with `docker-compose up`) and easy to extend (custom connectors).

Constraints:
- TypeScript end-to-end (shared types between backend and frontend via `core` package)
- Must handle timeseries data efficiently (rolling windows, period aggregation)
- External API integrations must be resilient (rate limits, retries, partial failures)
- Dashboard must serve CXO audience (mobile-responsive, clear at a glance)

## Goals / Non-Goals

**Goals:**
- Deliver a working metrics platform with all five KPIs computed from real data sources
- Provide a zero-config demo mode with realistic seed data for 4 teams over 6 months
- Enable extensibility through a connector abstraction so teams can add custom data sources
- Auto-generate actionable insights (correlation, anomaly, hotspot detection) — not just charts
- Ship production-ready with Docker Compose for local dev and Helm for k8s

**Non-Goals:**
- APM/observability (no traces, logs, or spans)
- Project management (not replacing Jira)
- CI/CD execution (not running builds)
- Individual performance tracking (measures systems, not people)
- Real-time streaming (batch collection on a schedule is sufficient)
- Multi-tenancy or SaaS hosting (single-org deployment)

## Decisions

### 1. Monorepo with pnpm workspaces

**Decision:** Structure as a pnpm monorepo with four packages: `core`, `connectors`, `server`, `dashboard`.

**Rationale:** Shared TypeScript types between backend and frontend eliminate drift. pnpm workspaces give fast installs and strict dependency isolation. Each package has its own `tsconfig.json` and test suite but shares the KPI type definitions from `core`.

**Alternatives considered:**
- *Separate repos* — rejected because shared types between backend/frontend would require publishing `core` as an npm package, adding CI complexity for a single-team project
- *Nx/Turborepo* — adds build orchestration overhead that isn't needed at this scale; pnpm workspaces are sufficient

### 2. PostgreSQL with timeseries-friendly schema (no TimescaleDB)

**Decision:** Use vanilla PostgreSQL 16 with composite indexes on `(team_id, kpi_type, period_end DESC)` for efficient range queries. No TimescaleDB extension.

**Rationale:** The data volume is modest — 5 KPIs × N teams × daily snapshots. At 50 teams, that's ~91K rows/year. Standard PostgreSQL with proper indexing handles this easily. TimescaleDB adds operational complexity (extension management, chunk policies) without meaningful benefit at this scale.

**Alternatives considered:**
- *TimescaleDB* — better for millions of rows per day; overkill here and adds deployment friction
- *SQLite* — simpler but lacks JSONB, array types, and concurrent write support needed for background jobs
- *ClickHouse* — column-store analytics DB; wrong tool for a mixed read/write workload with relational data

### 3. BullMQ + Redis for async job processing

**Decision:** Use BullMQ backed by Redis for scheduled data collection, KPI recalculation, and insight generation jobs.

**Rationale:** Data collection from external APIs (GitHub, Jira, PagerDuty) involves rate-limited HTTP calls that should not block the API server. BullMQ provides scheduled jobs (cron), retry with backoff, concurrency control, and job progress tracking. Redis is already lightweight and useful for caching API responses.

**Alternatives considered:**
- *pg-boss* — PostgreSQL-backed queue; avoids Redis but less mature ecosystem and no built-in cron scheduling
- *node-cron + in-process* — simpler but no retry, no concurrency control, and jobs die if the process restarts
- *Temporal/Inngest* — powerful workflow engines but massive overkill for ~10 scheduled jobs

### 4. Connector abstraction with base class

**Decision:** Define an abstract `BaseConnector` class with built-in retry logic, rate limiting, and a standard interface (`collect()`, `transform()`, `validate()`). Each data source (GitHub, Jira, PagerDuty, etc.) extends this.

**Rationale:** External APIs all share common concerns (auth, pagination, rate limits, error handling). A base class encapsulates these so individual connectors only implement data-source-specific logic. This also makes it straightforward for users to write custom connectors following the same pattern.

**Alternatives considered:**
- *Functional approach (no base class)* — less code but duplicates retry/rate-limit logic across connectors
- *Plugin system with dynamic loading* — more flexible but adds complexity for discovering and loading connectors; not needed when connectors are compiled TypeScript in the same monorepo

### 5. Express for the API server

**Decision:** Use Express with TypeScript for the REST API.

**Rationale:** Express is the most widely understood Node.js framework. The API surface is straightforward REST (< 15 endpoints, no GraphQL, no WebSockets). Express middleware handles auth, rate limiting, and error handling cleanly. The ecosystem of middleware is mature.

**Alternatives considered:**
- *Fastify* — faster but smaller ecosystem; performance isn't the bottleneck (database queries dominate)
- *NestJS* — too much abstraction and decorator ceremony for a project with < 15 routes
- *tRPC* — great for full-stack type safety but couples frontend and backend more tightly than needed for an open-source tool where the API should also serve non-React clients

### 6. React + Vite + Recharts + TailwindCSS for the dashboard

**Decision:** React 18 with Vite for bundling, Recharts for data visualization, and TailwindCSS for styling. Dark theme by default.

**Rationale:** Recharts is built on D3 but provides React-native components for area charts, bar charts, radar charts, and pie charts — all needed for the dashboard. TailwindCSS enables rapid UI development without managing CSS files. Vite provides fast HMR during development.

**Alternatives considered:**
- *Next.js* — SSR is unnecessary for a dashboard that sits behind auth; adds routing complexity
- *Victory/Nivo* — good charting libs but Recharts has better documentation and simpler API for the chart types needed
- *CSS Modules/Styled Components* — workable but slower to iterate than Tailwind for a utility-heavy dashboard layout

### 7. Health scoring as a four-tier classification

**Decision:** Classify each KPI into four tiers: Elite, Strong, Moderate, Alert. Composite health score is a weighted 0-100 index across all five KPIs.

**Rationale:** Four tiers map to actionable states (Elite = maintain, Strong = sustain, Moderate = improve, Alert = act now). This aligns with DORA's four-tier approach for deployment frequency and lead time, which the target audience already understands.

**Alternatives considered:**
- *Numeric-only scores* — harder for CXOs to interpret; "your cycle time is 4.2 days" means nothing without context
- *Three tiers (Good/Warning/Bad)* — too coarse; doesn't distinguish between "excellent" and "acceptable"
- *Custom tier count per KPI* — adds configuration complexity without clear user benefit

### 8. Insight generation as a batch job, not real-time

**Decision:** Run insight generation as a daily BullMQ job that computes correlations, anomalies, and hotspots across the latest data.

**Rationale:** Insights require looking at 90-day windows and cross-KPI correlations. This is inherently a batch computation. Running it daily aligns with the data collection schedule (also daily). Insights don't go stale within a day since the underlying KPIs are daily snapshots.

**Alternatives considered:**
- *On-demand computation* — expensive to compute correlations on every API request; response times would suffer
- *Event-driven (compute on new data)* — more complex, and the result is the same since data arrives daily

### 9. Database migrations with node-pg-migrate

**Decision:** Use `node-pg-migrate` for SQL-based database migrations.

**Rationale:** Raw SQL migrations give full control over the PostgreSQL-specific features used (JSONB, array types, partial indexes, gen_random_uuid()). The schema is well-defined upfront. node-pg-migrate is lightweight and doesn't require an ORM.

**Alternatives considered:**
- *Prisma* — ORM adds abstraction over raw SQL that isn't needed; Prisma's migration system is less flexible with raw PostgreSQL features
- *Knex migrations* — viable but Knex's query builder would go unused (we'd write raw SQL anyway)
- *TypeORM* — heavy, and its migration story is less predictable with complex PostgreSQL types

### 10. Docker Compose for dev, Helm for production

**Decision:** Docker Compose orchestrates local development (server + dashboard + postgres + redis). Helm chart handles Kubernetes deployment for production.

**Rationale:** Docker Compose is the standard for local multi-service development. Helm is the standard for Kubernetes deployments. Separating these concerns means dev setup is `docker-compose up` (no k8s required) while production gets proper resource limits, health checks, and scaling via Helm values.

**Alternatives considered:**
- *Docker Compose only* — insufficient for production (no health checks, rolling updates, resource limits)
- *Terraform* — infrastructure provisioning tool, not application deployment; complementary but not a replacement for Helm

## Risks / Trade-offs

**[External API rate limits]** → GitHub, Jira, and PagerDuty APIs all have rate limits. Mitigation: BaseConnector implements exponential backoff with jitter, respects `X-RateLimit-Remaining` headers, and BullMQ provides configurable concurrency per queue. Collection jobs are scheduled during off-peak hours (default: 2am).

**[Stale data between collection runs]** → KPI values are only as fresh as the last collection job (daily by default). Mitigation: Dashboard shows "last updated" timestamp prominently. Users can trigger manual collection via `POST /api/collect/trigger`. For most CXO use cases, daily granularity is sufficient.

**[Connector maintenance burden]** → External APIs evolve and can break connectors. Mitigation: Each connector has its own test suite with recorded API fixtures. The BaseConnector validates response schemas and logs warnings on unexpected shapes. Connectors degrade gracefully (partial data collection rather than total failure).

**[Insight accuracy at low data volumes]** → Pearson correlation over 90 days with only daily data points (N=90) can produce spurious correlations. Mitigation: Require minimum sample size (N >= 30) before generating correlation insights. Show confidence intervals in insight descriptions.

**[Schema migrations on upgrades]** → Users running self-hosted instances need to apply migrations when upgrading. Mitigation: node-pg-migrate runs automatically on server startup (idempotent). Migrations are additive — no destructive operations without a major version bump.

**[Demo data realism]** → If demo data looks fake, evaluators won't trust the tool. Mitigation: Seed data includes realistic variance (not uniform), deliberate anomalies (a rework hotspot, a cycle time improvement trend), mixed health levels across teams, and a recent P1 incident with full MTTRC timeline.

## Migration Plan

Not applicable — this is a greenfield project with no existing system to migrate from. The deployment sequence is:

1. Set up monorepo and core package with types
2. Implement database schema and migrations
3. Build connectors and server concurrently
4. Build dashboard against the API
5. Package with Docker Compose for demo mode
6. Add Helm chart for production deployment

Rollback strategy for production deployments: Helm rollback to previous revision. Database migrations are additive-only through minor versions.

## Open Questions

1. **OAuth provider for dashboard auth** — Should the optional dashboard OAuth support a specific provider (GitHub OAuth, Google, Okta) or use a generic OIDC flow? Initial implementation will use API key auth only; OAuth is Phase 4.
2. **Connector plugin discovery** — Should custom connectors be discoverable at runtime (dynamic import from a directory) or compiled into the monorepo? Starting with compiled; revisit if community adoption warrants a plugin system.
3. **Multi-org support** — The current design is single-org. If demand arises, the schema supports it (add `org_id` to tables), but the API and dashboard would need tenant isolation. Deferred.
4. **Notification channels** — Should insights trigger notifications (Slack, email)? Not in scope for initial release, but the insight generation job could emit events for a future notification system.

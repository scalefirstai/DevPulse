## ADDED Requirements

### Requirement: Five outcome-oriented KPIs
The system SHALL measure engineering health through exactly five KPIs: Cycle Time (idea to production elapsed time, in days), Defect Escape Rate (percentage of defects reaching production), Architectural Drift (divergence from intended architecture, in percent), Mean Time to Root Cause (time to understand failures, in hours), and Rework % (percentage of effort spent re-doing work on files changed within 21 days). These five KPIs SHALL be the only metrics tracked — the system SHALL NOT include vanity metrics such as velocity, story points, or bug count.

#### Scenario: KPI completeness
- **WHEN** a team's KPI dashboard is viewed
- **THEN** all five KPIs are displayed with current values, health tiers, and shift indicators

#### Scenario: No vanity metrics
- **WHEN** any user interface or API endpoint is accessed
- **THEN** no references to velocity, story points, lines of code, or commit count appear as tracked metrics

### Requirement: Insight generation engine
The system SHALL auto-generate insights through four detection mechanisms: correlation detection (Pearson coefficient |r| > 0.7 across KPI pairs over 90 days), anomaly detection (value > mean + 2 standard deviations on a rolling 30-day window), hotspot detection (team's metric > org-wide average + 10 percentage points), and shift tracking (direction + velocity + acceleration from 3-period moving average). Insights SHALL be generated as a daily batch job. Each insight SHALL have a severity (info, warning, critical) and reference the KPIs involved.

#### Scenario: Correlation insight
- **WHEN** cycle_time and defect_escape have a Pearson r of 0.82 over 90 days
- **THEN** an insight is generated describing the strong correlation with a plain-English explanation

#### Scenario: Anomaly insight
- **WHEN** a team's rework % spikes to 45% against a 30-day mean of 20% with stddev of 5%
- **THEN** a critical-severity anomaly insight is generated indicating the value is 5 standard deviations above the mean

#### Scenario: Hotspot insight
- **WHEN** Team A's rework is 35% and the org-wide average is 18%
- **THEN** a warning insight is generated identifying Team A as a rework hotspot with breakdown by cause

#### Scenario: Minimum sample size
- **WHEN** fewer than 30 data points exist for a KPI pair
- **THEN** no correlation insight is generated for that pair

### Requirement: Connector abstraction
The system SHALL define a `BaseConnector` abstract class with methods: `collect()` (fetch raw data from external API), `transform()` (convert raw data to DevPulse schema), and `validate()` (verify transformed data integrity). The BaseConnector SHALL provide built-in retry with exponential backoff, rate limit handling (respecting `X-RateLimit-Remaining` headers), pagination support, and structured error logging. Concrete connectors SHALL exist for: GitHub (PR lifecycle, file churn), Jira (issue lifecycle, defect classification), PagerDuty (incident timeline), OpsGenie (incident timeline), GitHub Actions (build/deploy timing), Jenkins (build/deploy timing), and ArchUnit/jDepend (architecture violations).

#### Scenario: Custom connector implementation
- **WHEN** a developer creates a new class extending BaseConnector
- **THEN** they only need to implement `collect()`, `transform()`, and `validate()` — retry, rate limiting, and pagination are inherited

#### Scenario: Connector rate limit handling
- **WHEN** a GitHub API response includes `X-RateLimit-Remaining: 5`
- **THEN** the connector reduces request rate and pauses when remaining reaches 0

#### Scenario: Partial collection failure
- **WHEN** one connector fails while others succeed during a collection run
- **THEN** the failed connector's error is logged, the other connectors' data is saved, and the job reports partial success

### Requirement: REST API surface
The system SHALL expose the following REST endpoints: `GET /api/health` (composite org health score 0-100), `GET /api/kpis/:teamSlug` (all 5 current KPI values), `GET /api/kpis/:teamSlug/:kpiType` (single KPI detail with breakdown), `GET /api/trends/:kpiType?range=90d` (timeseries data), `GET /api/compare?teams=a,b,c&kpi=all` (cross-team comparison), `GET /api/insights?severity=warning` (filtered insights), `GET /api/shifts/:teamSlug` (direction + velocity for all KPIs), `GET /api/config/thresholds` and `PUT /api/config/thresholds` (threshold configuration), `POST /api/collect/trigger` (manual collection trigger), `GET /api/collect/status` (collection job status), and full CRUD on `GET/POST /api/teams`, `PUT/DELETE /api/teams/:id`.

#### Scenario: KPI retrieval
- **WHEN** a client sends `GET /api/kpis/platform`
- **THEN** the response includes all 5 KPIs with current value, unit, health_level, and shift data for the "platform" team

#### Scenario: Trend data retrieval
- **WHEN** a client sends `GET /api/trends/cycle_time?range=30d`
- **THEN** the response includes an array of daily cycle_time values for the past 30 days

#### Scenario: Unknown team
- **WHEN** a client sends `GET /api/kpis/nonexistent-team`
- **THEN** the API returns a 404 status with an error message

### Requirement: Configuration model
The system SHALL be configurable via a YAML file (`devpulse.config.yaml`) with sections for: org metadata (name), connector configuration (per-connector enable/disable, credentials via environment variable references, repo-to-team mapping), collection schedule (cron expression, lookback days), rework window (configurable days, default 21), threshold overrides (per-KPI elite/strong/moderate values), and dashboard settings (refresh interval, default range, anonymize contributors flag).

#### Scenario: Environment variable substitution
- **WHEN** the config file contains `token: ${GITHUB_TOKEN}`
- **THEN** the system reads the value from the GITHUB_TOKEN environment variable at startup

#### Scenario: Connector disable
- **WHEN** a connector's `enabled` field is set to `false`
- **THEN** that connector is skipped during data collection runs

#### Scenario: Missing config file
- **WHEN** no `devpulse.config.yaml` file exists
- **THEN** the system starts in demo mode using built-in defaults and seed data

### Requirement: Non-goals enforcement
The system SHALL NOT collect application traces, logs, or spans (not an APM tool). The system SHALL NOT manage projects, sprints, or backlogs (not a project management tool). The system SHALL NOT execute builds or deployments (not a CI/CD tool). The system SHALL NOT page or alert on-call personnel (not an incident management tool). The system SHALL NOT track individual developer performance — all metrics SHALL be aggregated at the team level.

#### Scenario: No individual attribution
- **WHEN** KPI data is computed and displayed
- **THEN** no metric is attributed to an individual developer; all values are team-level aggregates

#### Scenario: Anonymize contributors option
- **WHEN** the `anonymize_contributors` config flag is set to true
- **THEN** individual author names in PR data are hidden from the dashboard UI

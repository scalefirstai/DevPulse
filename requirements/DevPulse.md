# DevPulse — Product Spec for Claude Code

## What This Is

An open-source engineering health framework that replaces vanity dev metrics (velocity, story points, bug count) with five outcome-oriented KPIs:

1. **Cycle Time** — idea → production elapsed time
2. **Defect Escape Rate** — % of defects reaching production
3. **Architectural Drift** — divergence from intended architecture
4. **Mean Time to Root Cause (MTTRC)** — time to *understand* failures, not just mitigate them
5. **Rework %** — % of effort spent re-doing recent work (≤21 days old)

It has two parts: a **data collection backend** (TypeScript/Node.js) that pulls from GitHub, Jira, CI/CD, and incident tools, and a **dashboard frontend** (React) that gives CXOs trend analysis, team comparisons, health scoring, and shift tracking.

## Tech Stack

- **Backend:** Node.js 20+, TypeScript, Express
- **Frontend:** React 18, Vite, Recharts, TailwindCSS
- **Database:** PostgreSQL 16 (timeseries-friendly schema)
- **Queue:** BullMQ + Redis (for async data collection jobs)
- **Auth:** API key for collectors, optional OAuth for dashboard
- **Packaging:** Docker Compose for local dev, Helm chart for k8s
- **Testing:** Vitest (frontend), Jest (backend), Playwright (e2e)
- **CI:** GitHub Actions
- **License:** Apache 2.0

## Project Structure

```
devpulse/
├── README.md
├── LICENSE                          # Apache 2.0
├── CONTRIBUTING.md
├── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── ci.yml                   # Lint, test, build on PR
│       ├── release.yml              # Semantic versioning + Docker publish
│       └── codeql.yml               # Security scanning
│
├── packages/
│   ├── core/                        # Shared types, KPI calculation engine
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── types/
│   │   │   │   ├── kpi.ts           # CycleTimeRecord, DefectRecord, etc.
│   │   │   │   ├── config.ts        # Thresholds, team config
│   │   │   │   ├── connectors.ts    # Connector interface definitions
│   │   │   │   └── index.ts
│   │   │   ├── engine/
│   │   │   │   ├── cycle-time.ts    # Cycle time calculation logic
│   │   │   │   ├── defect-escape.ts # Defect escape rate logic
│   │   │   │   ├── arch-drift.ts    # Architectural drift scoring
│   │   │   │   ├── mttrc.ts         # MTTRC calculation logic
│   │   │   │   ├── rework.ts        # Rework % detection logic
│   │   │   │   ├── health-score.ts  # Composite health scoring
│   │   │   │   ├── shift-tracker.ts # Direction + velocity of change
│   │   │   │   └── index.ts
│   │   │   └── utils/
│   │   │       ├── time.ts
│   │   │       ├── statistics.ts    # Moving averages, percentiles
│   │   │       └── thresholds.ts    # Elite/Strong/Moderate/Alert classification
│   │   └── __tests__/
│   │       ├── cycle-time.test.ts
│   │       ├── defect-escape.test.ts
│   │       ├── arch-drift.test.ts
│   │       ├── mttrc.test.ts
│   │       ├── rework.test.ts
│   │       └── health-score.test.ts
│   │
│   ├── connectors/                  # Data source integrations
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── base-connector.ts    # Abstract connector with retry, rate limiting
│   │   │   ├── github/
│   │   │   │   ├── github-connector.ts
│   │   │   │   ├── pr-analyzer.ts           # PR lifecycle → cycle time phases
│   │   │   │   ├── rework-detector.ts       # File churn analysis (≤21 day window)
│   │   │   │   ├── commit-classifier.ts     # Classify: feature, fix, refactor, rework
│   │   │   │   └── __tests__/
│   │   │   ├── jira/
│   │   │   │   ├── jira-connector.ts
│   │   │   │   ├── issue-lifecycle.ts       # Issue created → resolved → deployed
│   │   │   │   ├── defect-classifier.ts     # Where was defect found? (dev/qa/prod)
│   │   │   │   └── __tests__/
│   │   │   ├── ci/
│   │   │   │   ├── github-actions-connector.ts
│   │   │   │   ├── jenkins-connector.ts
│   │   │   │   ├── build-analyzer.ts        # Build → deploy phase timing
│   │   │   │   └── __tests__/
│   │   │   ├── incidents/
│   │   │   │   ├── pagerduty-connector.ts
│   │   │   │   ├── opsgenie-connector.ts
│   │   │   │   ├── incident-analyzer.ts     # Incident → root cause timeline
│   │   │   │   └── __tests__/
│   │   │   └── architecture/
│   │   │       ├── archunit-connector.ts    # Parse ArchUnit/jDepend reports
│   │   │       ├── dependency-analyzer.ts   # Dependency graph drift detection
│   │   │       ├── fitness-function-connector.ts  # CI fitness function results
│   │   │       └── __tests__/
│   │   └── README.md                # How to write a custom connector
│   │
│   ├── server/                      # API backend
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts             # Express app entrypoint
│   │   │   ├── config/
│   │   │   │   ├── database.ts      # PostgreSQL connection
│   │   │   │   ├── redis.ts         # Redis/BullMQ connection
│   │   │   │   └── env.ts           # Environment variable validation
│   │   │   ├── db/
│   │   │   │   ├── migrations/
│   │   │   │   │   ├── 001_create_teams.sql
│   │   │   │   │   ├── 002_create_kpi_snapshots.sql
│   │   │   │   │   ├── 003_create_incidents.sql
│   │   │   │   │   ├── 004_create_defects.sql
│   │   │   │   │   ├── 005_create_pr_events.sql
│   │   │   │   │   ├── 006_create_arch_violations.sql
│   │   │   │   │   └── 007_create_insights.sql
│   │   │   │   └── seed/
│   │   │   │       └── demo-data.sql        # Realistic demo dataset
│   │   │   ├── routes/
│   │   │   │   ├── kpis.ts                  # GET /api/kpis/:teamId/:kpi
│   │   │   │   ├── teams.ts                 # CRUD /api/teams
│   │   │   │   ├── trends.ts               # GET /api/trends/:kpi?range=90d
│   │   │   │   ├── comparisons.ts          # GET /api/compare?teams=a,b,c
│   │   │   │   ├── insights.ts             # GET /api/insights (auto-generated)
│   │   │   │   ├── health.ts               # GET /api/health (composite score)
│   │   │   │   └── config.ts               # GET/PUT /api/config (thresholds)
│   │   │   ├── jobs/
│   │   │   │   ├── collection-scheduler.ts  # Cron-based data collection
│   │   │   │   ├── kpi-calculator.ts        # Periodic KPI recalculation
│   │   │   │   ├── insight-generator.ts     # Correlation + anomaly detection
│   │   │   │   └── shift-calculator.ts      # Direction/velocity of change
│   │   │   ├── services/
│   │   │   │   ├── kpi-service.ts
│   │   │   │   ├── trend-service.ts
│   │   │   │   ├── insight-service.ts
│   │   │   │   └── comparison-service.ts
│   │   │   └── middleware/
│   │   │       ├── auth.ts                  # API key validation
│   │   │       ├── error-handler.ts
│   │   │       └── rate-limiter.ts
│   │   └── __tests__/
│   │       ├── routes/
│   │       └── services/
│   │
│   └── dashboard/                   # React frontend
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── index.html
│       ├── public/
│       │   └── devpulse-logo.svg
│       ├── src/
│       │   ├── main.tsx
│       │   ├── App.tsx
│       │   ├── api/
│       │   │   ├── client.ts                # Axios instance with interceptors
│       │   │   ├── kpis.ts                  # KPI data fetching hooks
│       │   │   ├── teams.ts
│       │   │   ├── trends.ts
│       │   │   └── insights.ts
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── Header.tsx
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   └── Layout.tsx
│       │   │   ├── kpi-cards/
│       │   │   │   ├── KpiCard.tsx           # Single KPI card with health badge
│       │   │   │   ├── KpiGrid.tsx           # 5-card grid layout
│       │   │   │   ├── ShiftIndicator.tsx    # ▲▼ trend direction
│       │   │   │   └── HealthBadge.tsx       # Elite/Strong/Moderate/Alert
│       │   │   ├── charts/
│       │   │   │   ├── TrendChart.tsx        # Area chart with threshold bands
│       │   │   │   ├── ComparisonBar.tsx     # Team comparison bar chart
│       │   │   │   ├── HealthRadar.tsx       # Radar chart (5 KPIs)
│       │   │   │   ├── CycleTimeBreakdown.tsx  # Stacked phases
│       │   │   │   └── ReworkPie.tsx         # Rework by cause category
│       │   │   ├── insights/
│       │   │   │   ├── InsightCard.tsx       # Single insight with color coding
│       │   │   │   └── InsightGrid.tsx       # Auto-generated insights panel
│       │   │   ├── tables/
│       │   │   │   ├── TeamTable.tsx         # Cross-team KPI comparison
│       │   │   │   └── IncidentTable.tsx     # Recent incidents with MTTRC
│       │   │   └── common/
│       │   │       ├── ThresholdBar.tsx
│       │   │       ├── Tooltip.tsx
│       │   │       └── EmptyState.tsx
│       │   ├── pages/
│       │   │   ├── Overview.tsx              # Health score + radar + all KPIs
│       │   │   ├── Trends.tsx                # Deep dive single KPI
│       │   │   ├── Teams.tsx                 # Team comparison view
│       │   │   ├── Settings.tsx              # Thresholds + connector config
│       │   │   └── Onboarding.tsx            # First-run setup wizard
│       │   ├── hooks/
│       │   │   ├── useKpiData.ts
│       │   │   ├── useHealthScore.ts
│       │   │   ├── useShiftTracking.ts
│       │   │   └── useAutoRefresh.ts
│       │   ├── utils/
│       │   │   ├── colors.ts                # KPI color scheme
│       │   │   ├── formatters.ts            # Number/date formatting
│       │   │   └── thresholds.ts            # Client-side threshold logic
│       │   └── types/
│       │       └── index.ts                 # Shared frontend types
│       └── __tests__/
│           ├── components/
│           └── pages/
│
├── deploy/
│   ├── docker/
│   │   ├── Dockerfile.server
│   │   ├── Dockerfile.dashboard
│   │   └── nginx.conf
│   └── helm/
│       └── devpulse/
│           ├── Chart.yaml
│           ├── values.yaml
│           └── templates/
│               ├── server-deployment.yaml
│               ├── dashboard-deployment.yaml
│               ├── postgres-statefulset.yaml
│               ├── redis-deployment.yaml
│               └── ingress.yaml
│
├── docs/
│   ├── getting-started.md
│   ├── kpi-definitions.md           # Detailed KPI specs with formulas
│   ├── connector-guide.md           # How to write a custom connector
│   ├── api-reference.md             # REST API docs
│   ├── deployment.md                # Docker, k8s, bare metal
│   └── architecture.md              # System design decisions
│
└── examples/
    ├── demo-config.yaml             # Sample config with mock data
    └── custom-connector/
        └── example-connector.ts     # Template for building connectors
```

## Database Schema

```sql
-- Teams
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- KPI Snapshots (timeseries core table)
CREATE TABLE kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    kpi_type VARCHAR(20) NOT NULL,       -- cycle_time, defect_escape, arch_drift, mttrc, rework
    value DECIMAL(10,2) NOT NULL,
    unit VARCHAR(10) NOT NULL,            -- days, percent, hours
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    breakdown JSONB DEFAULT '{}',         -- Sub-phase data, category splits
    health_level VARCHAR(20),             -- elite, strong, moderate, alert
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, kpi_type, period_end)
);

CREATE INDEX idx_snapshots_team_kpi ON kpi_snapshots(team_id, kpi_type, period_end DESC);

-- PR Events (for cycle time + rework)
CREATE TABLE pr_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    external_id VARCHAR(100) NOT NULL,    -- GitHub PR number
    title TEXT,
    author VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL,
    first_commit_at TIMESTAMPTZ,
    first_review_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    merged_at TIMESTAMPTZ,
    deployed_at TIMESTAMPTZ,
    is_rework BOOLEAN DEFAULT FALSE,      -- True if modifying files changed ≤21d ago
    rework_reason VARCHAR(50),            -- requirement_change, bug_fix, refactor, scope_creep
    files_changed INTEGER,
    additions INTEGER,
    deletions INTEGER,
    labels JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}'
);

-- Defects
CREATE TABLE defects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    external_id VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,        -- critical, major, minor
    found_in VARCHAR(20) NOT NULL,        -- code_review, unit_test, integration_test, qa, staging, production
    escaped BOOLEAN DEFAULT FALSE,        -- True if found_in = production
    category VARCHAR(50),                 -- logic_error, integration, config_drift, requirements_gap
    created_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'
);

-- Incidents (for MTTRC)
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    external_id VARCHAR(100) NOT NULL,
    severity VARCHAR(10) NOT NULL,        -- p1, p2, p3, p4
    title TEXT,
    detected_at TIMESTAMPTZ NOT NULL,
    mitigated_at TIMESTAMPTZ,             -- Service restored
    root_cause_at TIMESTAMPTZ,            -- Actual root cause identified
    resolved_at TIMESTAMPTZ,              -- Fix deployed
    root_cause_method VARCHAR(30),        -- observability, log_analysis, code_review, brute_force
    root_cause_description TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,   -- Same class of incident seen before?
    recurrence_of UUID REFERENCES incidents(id),
    metadata JSONB DEFAULT '{}'
);

-- Architecture Violations
CREATE TABLE arch_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),
    rule_name VARCHAR(200) NOT NULL,      -- e.g. "UI layer must not import data layer"
    violation_type VARCHAR(50),           -- dependency, layer_breach, coupling, pattern_deviation
    source_component VARCHAR(200),
    target_component VARCHAR(200),
    file_path TEXT,
    first_detected_at TIMESTAMPTZ NOT NULL,
    resolved_at TIMESTAMPTZ,
    scan_source VARCHAR(50),              -- archunit, jdepend, custom_ci, manual
    metadata JSONB DEFAULT '{}'
);

-- Auto-generated insights
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),    -- NULL = org-wide
    insight_type VARCHAR(30) NOT NULL,    -- correlation, anomaly, trend_change, hotspot
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(20),                 -- info, warning, critical
    kpis_involved VARCHAR(50)[] NOT NULL, -- e.g. {'cycle_time', 'defect_escape'}
    data JSONB DEFAULT '{}',              -- Supporting data points
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    dismissed_at TIMESTAMPTZ
);

-- Threshold configuration
CREATE TABLE thresholds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id),    -- NULL = org-wide default
    kpi_type VARCHAR(20) NOT NULL,
    elite_max DECIMAL(10,2) NOT NULL,
    strong_max DECIMAL(10,2) NOT NULL,
    moderate_max DECIMAL(10,2) NOT NULL,
    -- Anything above moderate_max = "alert"
    UNIQUE(team_id, kpi_type)
);

-- Seed default thresholds
INSERT INTO thresholds (team_id, kpi_type, elite_max, strong_max, moderate_max) VALUES
    (NULL, 'cycle_time', 1, 3, 14),
    (NULL, 'defect_escape', 5, 10, 20),
    (NULL, 'arch_drift', 2, 5, 15),
    (NULL, 'mttrc', 1, 4, 24),
    (NULL, 'rework', 10, 20, 35);
```

## KPI Calculation Logic

### Cycle Time
```
Input:  PR events + Jira issue lifecycle
Logic:  For each PR merged in the period:
        cycle_time = deployed_at - issue_created_at (or first_commit_at if no issue)
        
Breakdown phases:
        ideation   = first_commit_at - issue_created_at
        coding     = first_review_at - first_commit_at
        review     = approved_at - first_review_at
        deploy     = deployed_at - merged_at

Output: Median cycle time for the period (not mean — outliers skew mean)
```

### Defect Escape Rate
```
Input:  Defect records from Jira (or similar)
Logic:  escaped_count = COUNT(defects WHERE found_in = 'production')
        total_count   = COUNT(defects)
        rate          = (escaped_count / total_count) * 100

Breakdown by:
        severity:  critical / major / minor
        category:  logic_error / integration / config_drift / requirements_gap

Output: Escape rate % with severity-weighted variant
```

### Architectural Drift
```
Input:  ArchUnit/jDepend CI reports, or dependency-analyzer scans
Logic:  active_violations  = COUNT(violations WHERE resolved_at IS NULL)
        total_rules        = COUNT(DISTINCT rule_name across all scans)
        drift_pct          = (active_violations / total_rules) * 100

Trend:  Compare active_violations across periods.
        Velocity = (current_violations - prev_violations) / prev_violations

Output: Drift % + velocity (accelerating/decelerating/stable)
```

### Mean Time to Root Cause
```
Input:  Incident records from PagerDuty/OpsGenie
Logic:  For each incident in the period:
        mttrc = root_cause_at - detected_at  (in hours)

        If root_cause_at IS NULL:
            Flag as "root cause unknown" — counts against the metric

Output: Median MTTRC (hours) + % of incidents with unknown root cause
        + breakdown by root_cause_method
```

### Rework %
```
Input:  PR events from GitHub
Logic:  For each PR merged in the period:
        Get files changed in the PR.
        For each file, check: was this file also changed in a PR
        merged within the prior 21 days?
        If yes → this PR is rework.

        rework_pct = (rework_prs / total_prs) * 100

Breakdown by rework_reason:
        bug_fix            — PR fixes a defect in recent code
        requirement_change — linked Jira issue type = "change request"
        refactor           — no linked defect, same files touched
        scope_creep        — PR adds to a feature that was "done"

Output: Rework % + breakdown by cause
```

## Insight Generation Engine

The insight generator runs periodically (default: daily) and produces auto-generated findings.

### Correlation Detection
```
For each pair of KPIs:
    Compute Pearson correlation over the last 90 days.
    If |r| > 0.7:
        Generate insight: "KPI A and KPI B are strongly correlated.
        [Describe the relationship in plain English]."

Example:
    cycle_time ↓ 18% AND defect_escape ↑ 3pp
    → "Cycle time improved 18% this quarter, but defect escape rate
       rose 3 points. Faster reviews may be less thorough."
```

### Anomaly Detection
```
For each KPI, each team:
    Compute rolling 30-day mean and stddev.
    If latest value > mean + 2*stddev:
        Generate insight: "[KPI] for [team] spiked to [value],
        which is [X] standard deviations above the 30-day average."
```

### Hotspot Detection
```
For rework:
    Group rework PRs by team.
    If any team's rework % > org-wide rework % + 10pp:
        Generate insight: "[Team] rework at [X]% — highest across all
        teams. Breakdown: [top cause] accounts for [Y]%."
```

### Shift Tracking
```
For each KPI, each team:
    current  = latest period value
    previous = prior period value
    shift_pct = ((current - previous) / previous) * 100
    direction = improving | declining | flat (if |shift_pct| < 2%)
    
    Compute 3-period moving average to determine velocity:
    accelerating = shift is getting larger period over period
    decelerating = shift is getting smaller
    stable = shift is roughly constant
```

## API Endpoints

```
GET    /api/health                          → Composite org health score (0-100)
GET    /api/kpis/:teamSlug                  → All 5 KPIs, current values
GET    /api/kpis/:teamSlug/:kpiType         → Single KPI detail + breakdown
GET    /api/trends/:kpiType?range=90d       → Timeseries data for charting
GET    /api/compare?teams=a,b,c&kpi=all     → Cross-team comparison
GET    /api/insights?severity=warning        → Auto-generated insights
GET    /api/shifts/:teamSlug                 → Direction + velocity for all KPIs
GET    /api/config/thresholds                → Current threshold config
PUT    /api/config/thresholds                → Update thresholds

POST   /api/collect/trigger                  → Manually trigger data collection
GET    /api/collect/status                   → Collection job status

GET    /api/teams                            → List teams
POST   /api/teams                            → Create team
PUT    /api/teams/:id                        → Update team
DELETE /api/teams/:id                        → Delete team
```

## Configuration File

```yaml
# devpulse.config.yaml

org:
  name: "Acme Engineering"

connectors:
  github:
    enabled: true
    token: ${GITHUB_TOKEN}
    org: "acme-corp"
    repos:
      - name: "api-gateway"
        team: "platform"
      - name: "payment-service"
        team: "payments"
      - name: "auth-service"
        team: "identity"

  jira:
    enabled: true
    url: "https://acme.atlassian.net"
    email: ${JIRA_EMAIL}
    token: ${JIRA_TOKEN}
    projects:
      - key: "PLAT"
        team: "platform"
      - key: "PAY"
        team: "payments"

  pagerduty:
    enabled: true
    token: ${PAGERDUTY_TOKEN}
    services:
      - id: "P1234"
        team: "platform"

  architecture:
    enabled: true
    source: "ci_artifacts"            # or "archunit_reports" or "manual"
    report_path: "build/reports/archunit/"

collection:
  schedule: "0 2 * * *"              # Daily at 2am
  lookback_days: 90                  # How far back to pull data

rework:
  window_days: 21                    # Files changed within this window = rework

thresholds:                          # Override defaults per org
  cycle_time:    { elite: 1, strong: 3, moderate: 14 }
  defect_escape: { elite: 5, strong: 10, moderate: 20 }
  arch_drift:    { elite: 2, strong: 5, moderate: 15 }
  mttrc:         { elite: 1, strong: 4, moderate: 24 }
  rework:        { elite: 10, strong: 20, moderate: 35 }

dashboard:
  refresh_interval: 300              # Seconds
  default_range: "90d"
  anonymize_contributors: false      # Hide individual names in team view
```

## Implementation Phases

### Phase 1: Foundation (Weeks 1-2)
```
Priority: Get the core engine + GitHub connector working with demo data.

Tasks:
- [ ] Monorepo setup (pnpm workspaces)
- [ ] Core package: types, threshold logic, health score calculator
- [ ] PostgreSQL schema + migrations (use node-pg-migrate)
- [ ] Seed data: generate 6 months of realistic demo data for 4 teams
- [ ] GitHub connector: PR lifecycle extraction
- [ ] Rework detector: file churn analysis with 21-day window
- [ ] Cycle time calculator: PR-based (commit → merge → deploy)
- [ ] Express API: /api/kpis, /api/trends, /api/health
- [ ] Docker Compose: server + postgres + redis
- [ ] Basic CI: lint + test on PR
```

### Phase 2: Dashboard (Weeks 3-4)
```
Priority: Ship the React dashboard with the overview page.

Tasks:
- [ ] Vite + React + Tailwind scaffold
- [ ] KPI card component (value + health badge + shift indicator)
- [ ] 5-card grid layout (overview page)
- [ ] Health radar chart (Recharts)
- [ ] Trend chart with threshold bands
- [ ] Team comparison table
- [ ] Team comparison bar chart
- [ ] API client hooks (useKpiData, useHealthScore, useShiftTracking)
- [ ] Dark theme (the dashboard from the article)
- [ ] Responsive layout (works on mobile for CXOs checking from phone)
- [ ] Onboarding page: first-run setup wizard
```

### Phase 3: Intelligence (Weeks 5-6)
```
Priority: Insight generation — this is what makes it not just another dashboard.

Tasks:
- [ ] Insight generator job (BullMQ scheduled)
- [ ] Correlation detection (Pearson across KPI pairs)
- [ ] Anomaly detection (rolling mean + 2σ threshold)
- [ ] Hotspot detection (team outlier identification)
- [ ] Shift tracker (direction + velocity + acceleration)
- [ ] Insight cards on dashboard (color-coded by severity)
- [ ] Jira connector: issue lifecycle + defect classification
- [ ] Defect escape rate calculator
- [ ] PagerDuty connector: incident timeline extraction
- [ ] MTTRC calculator
```

### Phase 4: Architecture + Polish (Weeks 7-8)
```
Priority: Architectural drift + production readiness.

Tasks:
- [ ] ArchUnit report parser connector
- [ ] Dependency-analyzer (static analysis on repo)
- [ ] Arch drift calculator
- [ ] CI fitness function results connector
- [ ] Settings page (threshold config UI)
- [ ] API key auth middleware
- [ ] Helm chart for k8s deployment
- [ ] Playwright e2e tests
- [ ] README, docs, getting-started guide
- [ ] Demo mode: one-command docker-compose up with seed data
- [ ] GitHub repo setup: issues templates, PR template, CODEOWNERS
```

## Demo Mode

Running `docker-compose up` with no configuration should start the dashboard with realistic demo data. The demo includes:

- 4 teams: Platform, Payments, Identity, Data Engineering
- 6 months of timeseries KPI data with realistic trends
- Pre-generated insights showing correlations
- Mixed health levels across teams (not everything is green)
- One team with a rework hotspot, one with improving cycle time
- A recent P1 incident with MTTRC tracking

This is critical for adoption. Nobody evaluates a metrics tool by reading docs. They evaluate it by seeing the dashboard with data in it.

## README Structure

```markdown
# DevPulse

Engineering health metrics that tell the truth.

[screenshot of dashboard here]

## Why

Your sprint dashboard says you're shipping 200 story points per sprint.
Your production says otherwise. DevPulse measures what actually matters.

## The 5 KPIs

1. **Cycle Time** — idea → production, not commit → merge
2. **Defect Escape Rate** — how effective are your quality gates?
3. **Architectural Drift** — is your codebase rotting?
4. **Mean Time to Root Cause** — do you understand your failures?
5. **Rework %** — how much of your work is re-doing recent work?

## Quick Start

    docker-compose up

Open http://localhost:3000. You'll see demo data for 4 teams.

## Connect Your Data

    cp devpulse.config.example.yaml devpulse.config.yaml
    # Add your GitHub token, Jira credentials, PagerDuty token
    docker-compose up

## Docs

- [KPI Definitions](docs/kpi-definitions.md)
- [Writing a Custom Connector](docs/connector-guide.md)
- [API Reference](docs/api-reference.md)
- [Deployment Guide](docs/deployment.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
```

## Non-Goals (What This Isn't)

- Not an APM tool. Doesn't collect traces or logs.
- Not a project management tool. Doesn't replace Jira.
- Not a CI/CD tool. Doesn't run builds.
- Not an incident management tool. Doesn't page anyone.
- Not an individual performance tracker. This measures *systems*, not people.

It's *infrastructure* for understanding engineering health. The layer that sits on top of your existing tools and tells you whether your organization is actually getting better at building software.
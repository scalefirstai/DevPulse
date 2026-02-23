# Architecture

## Package Structure

```
packages/
├── core/           Pure TypeScript library — types, KPI engine, utilities
├── connectors/     Data source integrations extending BaseConnector
├── server/         Express API, PostgreSQL, BullMQ workers
└── dashboard/      React SPA with Recharts visualization
```

## Design Decisions

1. **pnpm monorepo** — Single repo with workspace packages for shared types and independent deployment
2. **Vanilla PostgreSQL** — No ORM; direct SQL with `node-pg` for performance and transparency
3. **BullMQ + Redis** — Reliable job processing for data collection, KPI calculation, and insight generation
4. **Connector abstraction** — BaseConnector provides retry, rate limiting, and pagination; each integration implements collect/transform/validate
5. **Express over frameworks** — Minimal dependencies, familiar middleware model
6. **Recharts** — React-native charting with good TypeScript support
7. **Dark-first design** — Dashboard defaults to dark theme for engineering tool aesthetics

## Data Flow

```
Connectors → BullMQ Jobs → PostgreSQL → API → Dashboard
```

1. **Collection**: Connectors fetch raw data from GitHub, Jira, PagerDuty, etc.
2. **Calculation**: BullMQ workers compute KPI snapshots from raw events
3. **Insight Generation**: Daily job detects correlations, anomalies, and hotspots
4. **Serving**: Express API queries PostgreSQL and returns formatted data
5. **Visualization**: React dashboard renders KPI cards, charts, and insights

## Database Schema

- **teams** — Team definitions with slug and metadata
- **kpi_snapshots** — Periodic KPI values per team (composite unique constraint)
- **pr_events** — Pull request lifecycle data
- **defects** — Defect tracking with severity and escape detection
- **incidents** — Incident lifecycle with MTTRC tracking
- **arch_violations** — Architecture rule violations
- **insights** — Auto-generated insights with dismissal support
- **thresholds** — Configurable health tier boundaries

## Health Scoring

Each KPI maps to a tier (Elite/Strong/Moderate/Alert) based on configurable thresholds. The composite health score (0-100) is a weighted average of tier scores.

## Shift Tracking

Direction and velocity are computed from a 3-period moving average:
- **Direction**: Comparing latest value to previous average
- **Velocity**: Comparing rate of change across periods

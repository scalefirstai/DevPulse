# Frontend Architecture

## Tech Stack

- **React 18** with TypeScript strict mode
- **Vite** for build tooling and dev server
- **TailwindCSS** with dark-first design
- **Recharts** for data visualization
- **React Router v6** for client-side routing
- **Axios** for API communication

## Project Structure

```
packages/dashboard/
├── src/
│   ├── main.tsx                 # Entry point
│   ├── App.tsx                  # Router configuration
│   ├── api/                     # API client layer
│   │   ├── client.ts            # Axios instance with interceptors
│   │   ├── kpis.ts              # KPI data fetching
│   │   ├── teams.ts             # Team CRUD operations
│   │   ├── trends.ts            # Trend data fetching
│   │   └── insights.ts          # Insight fetching and dismissal
│   ├── components/              # Reusable UI components
│   │   ├── Layout.tsx           # Responsive sidebar + header
│   │   ├── KpiCard.tsx          # Single KPI card with health badge
│   │   ├── KpiGrid.tsx          # 5-card responsive grid
│   │   ├── HealthBadge.tsx      # Elite/Strong/Moderate/Alert badge
│   │   ├── ShiftIndicator.tsx   # Direction arrow + velocity
│   │   ├── ThresholdBar.tsx     # Horizontal bar with tier bands
│   │   ├── HealthRadar.tsx      # Radar chart (5 KPIs)
│   │   ├── TrendChart.tsx       # Area chart with threshold bands
│   │   ├── ComparisonBar.tsx    # Team comparison bar chart
│   │   ├── CycleTimeBreakdown.tsx  # Stacked phase chart
│   │   ├── ReworkPie.tsx        # Donut chart by rework cause
│   │   ├── InsightCard.tsx      # Severity-coded insight card
│   │   ├── InsightGrid.tsx      # Auto-generated insights panel
│   │   ├── TeamTable.tsx        # Sortable cross-team comparison
│   │   ├── IncidentTable.tsx    # Recent incidents with MTTRC
│   │   ├── Tooltip.tsx          # Hover tooltip
│   │   ├── EmptyState.tsx       # No-data placeholder
│   │   ├── ErrorBanner.tsx      # Fixed error banner with retry
│   │   └── Toast.tsx            # Auto-dismiss notifications
│   ├── pages/
│   │   ├── Overview.tsx         # Health score + radar + all KPIs
│   │   ├── Trends.tsx           # Deep-dive single KPI analysis
│   │   ├── Teams.tsx            # Team comparison view
│   │   ├── Settings.tsx         # Threshold configuration UI
│   │   └── Onboarding.tsx       # First-run setup wizard
│   ├── hooks/
│   │   ├── useKpiData.ts        # KPI data with loading/error state
│   │   ├── useHealthScore.ts    # Composite health score
│   │   ├── useShiftTracking.ts  # Shift direction + velocity
│   │   └── useAutoRefresh.ts    # Configurable auto-refresh (default 300s)
│   └── utils/
│       ├── colors.ts            # Tier colors, KPI colors, chart theme
│       └── formatters.ts        # Number, percent, duration, date formatting
├── e2e/                         # Playwright end-to-end tests
├── tailwind.config.js           # Dark mode + brand colors
├── postcss.config.js
├── vite.config.ts
└── playwright.config.ts
```

## Pages

### Overview (`/`)
The primary dashboard view showing:
- Composite health score (0–100) with animated gauge
- Health radar chart mapping all 5 KPIs
- KPI card grid with current values, health badges, and shift indicators
- Recent auto-generated insights

### Trends (`/trends`)
Deep-dive into individual KPIs over time:
- Time range selector (30d, 90d, 180d, 1y)
- KPI selector for switching between metrics
- Area chart with threshold band overlays
- Cycle time breakdown (stacked bar chart for phases)
- Rework breakdown (donut chart by cause)

### Teams (`/teams`)
Cross-team comparison:
- Horizontal bar chart comparing teams per KPI
- Sortable table with health badges per KPI column
- Incident table showing recent incidents with MTTRC values

### Settings (`/settings`)
Configuration management:
- Editable threshold form for all 5 KPIs
- Validation: elite < strong < moderate
- Save triggers PUT to `/api/config/thresholds`

### Onboarding (`/onboarding`)
First-run setup wizard (3 steps):
1. **Team creation**: Name + auto-generated slug
2. **Connector selection**: GitHub, Jira, PagerDuty checkboxes
3. **Completion**: Navigate to overview

## Design System

### Color Palette

| Tier | Background | Text | Hex |
|------|-----------|------|-----|
| Elite | `bg-emerald-900/30` | `text-emerald-400` | `#34d399` |
| Strong | `bg-blue-900/30` | `text-blue-400` | `#60a5fa` |
| Moderate | `bg-amber-900/30` | `text-amber-400` | `#fbbf24` |
| Alert | `bg-red-900/30` | `text-red-400` | `#f87171` |

### Dark Theme
The dashboard defaults to a dark theme (slate-900 background) designed for engineering tool aesthetics. This matches the common deployment context (wall-mounted engineering dashboards, developer workstations).

### Responsive Layout
- Desktop (xl+): Fixed sidebar with icon + label navigation
- Tablet/mobile: Hamburger menu with slide-out sidebar
- KPI grid: 1 column (mobile) → 2 columns (sm) → 3 columns (md) → 5 columns (xl)

## API Client

The Axios client at `api/client.ts` provides:
- Base URL: `/api` (proxied in development)
- API key injection from `localStorage` via request interceptor
- Rate limit warning via response interceptor (logs 429 status)

## Auto-Refresh

The `useAutoRefresh` hook provides configurable polling:
- Default interval: 300 seconds (5 minutes)
- Enable/disable toggle
- Manual refresh callback
- Cleans up on unmount

## Testing

### Unit Tests
Component tests using Vitest + React Testing Library.

### E2E Tests
Playwright tests covering all pages:
- `overview.spec.ts` — KPI cards render, health radar visible, team selector works
- `trends.spec.ts` — Range buttons cycle, KPI selector switches charts
- `teams.spec.ts` — Comparison bar visible, team table sortable
- `settings.spec.ts` — Threshold form editable, save button works
- `onboarding.spec.ts` — Welcome screen, team creation with auto-slug

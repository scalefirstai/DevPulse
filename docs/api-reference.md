# API Reference

Base URL: `http://localhost:4000/api`

## Health

### GET /api/health
Returns composite organization health score.

**Response**: `{ "score": 72, "teamCount": 4 }`

### GET /api/ping
Health check endpoint.

**Response**: `{ "status": "ok" }`

## KPIs

### GET /api/kpis/:teamSlug
Returns all 5 current KPI values for a team.

**Response**:
```json
[
  {
    "kpiType": "cycle_time",
    "value": 3.5,
    "unit": "days",
    "healthLevel": "strong",
    "breakdown": { "ideation": 0.7, "coding": 1.3, "review": 0.7, "deploy": 0.8 }
  }
]
```

### GET /api/kpis/:teamSlug/:kpiType
Returns detailed KPI data for a specific metric.

## Trends

### GET /api/trends/:kpiType?range=90d
Returns timeseries data for charting. Range: `30d`, `60d`, `90d`.

**Query params**: `range` (default: 90d), `team` (optional slug)

**Response**:
```json
[
  { "periodEnd": "2024-01-31", "value": 3.5, "healthLevel": "strong" }
]
```

## Comparisons

### GET /api/compare?teams=a,b,c&kpi=all
Returns cross-team KPI comparison.

**Query params**: `teams` (comma-separated slugs), `kpi` (`all` or specific type)

## Insights

### GET /api/insights?severity=warning
Returns auto-generated insights. Optional severity filter.

### POST /api/insights/:id/dismiss
Dismisses an insight.

## Shifts

### GET /api/shifts/:teamSlug
Returns shift direction and velocity for all KPIs.

**Response**:
```json
[
  { "kpiType": "cycle_time", "shiftPercent": -8.5, "direction": "improving", "velocity": "accelerating" }
]
```

## Configuration

### GET /api/config/thresholds
Returns threshold configuration for all KPIs.

### PUT /api/config/thresholds
Updates threshold values.

**Body**:
```json
{
  "cycle_time": { "elite_max": 3, "strong_max": 7, "moderate_max": 14 }
}
```

## Data Collection

### POST /api/collect/trigger
Triggers data collection. Requires `X-API-Key` header.

### GET /api/collect/status
Returns queue status. Requires `X-API-Key` header.

## Teams

### GET /api/teams
Returns all teams.

### POST /api/teams
Creates a team. Body: `{ "name": "...", "slug": "...", "metadata": {} }`

### PUT /api/teams/:id
Updates a team.

### DELETE /api/teams/:id
Deletes a team.

## Authentication

Write endpoints and collection endpoints require an `X-API-Key` header. The key is validated against a SHA-256 hash stored in the `API_KEY_HASH` environment variable.

## Rate Limits

| Endpoint Type | Limit |
|--------------|-------|
| Read (GET) | 100/min per IP |
| Write (POST/PUT/DELETE) | 20/min per IP |
| Collection | 5/min per API key |

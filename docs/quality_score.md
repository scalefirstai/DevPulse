# Quality Score

## Overview

DevPulse measures engineering quality through five outcome-oriented KPIs, each mapped to a four-tier health classification. The composite quality score (0–100) aggregates these tiers into a single organizational or team-level health indicator.

## The Five KPIs

| KPI | Unit | What It Measures |
|-----|------|------------------|
| Cycle Time | days | Idea → production elapsed time (median) |
| Defect Escape Rate | % | Percentage of defects reaching production |
| Architectural Drift | % | Divergence from intended architecture |
| MTTRC | hours | Mean Time to Root Cause for incidents |
| Rework | % | Effort spent re-doing work on files changed within 21 days |

## Health Tiers

Each KPI value maps to one of four tiers based on configurable thresholds:

| Tier | Score | Meaning |
|------|-------|---------|
| Elite | 100 | World-class performance |
| Strong | 75 | Above average, sustainable |
| Moderate | 50 | Acceptable but room for improvement |
| Alert | 25 | Needs immediate attention |

### Default Thresholds

| KPI | Elite (≤) | Strong (≤) | Moderate (≤) | Alert (>) |
|-----|-----------|------------|--------------|-----------|
| Cycle Time | 1 day | 3 days | 14 days | 14 days |
| Defect Escape Rate | 5% | 10% | 20% | 20% |
| Architectural Drift | 2% | 5% | 15% | 15% |
| MTTRC | 1 hour | 4 hours | 24 hours | 24 hours |
| Rework | 10% | 20% | 35% | 35% |

Thresholds are configurable per team and per organization via the Settings page or the `/api/config/thresholds` API.

## Composite Health Score

The composite score is a weighted average of the individual KPI tier scores:

```
composite = (cycleTime_score × w1 + defectEscape_score × w2 + archDrift_score × w3 + mttrc_score × w4 + rework_score × w5) / total_weight
```

Default weights are equal (1.0 each), meaning each KPI contributes equally. The result is a score from 0 to 100:

- **90–100**: Elite — all KPIs performing at elite or strong levels
- **70–89**: Strong — most KPIs healthy, minor areas for improvement
- **50–69**: Moderate — mixed signals, some KPIs need attention
- **0–49**: Alert — multiple KPIs in poor health

## Shift Tracking

Beyond current values, DevPulse tracks the **direction** and **velocity** of change for each KPI:

### Direction
- **Improving**: Latest value is better than the 3-period moving average
- **Declining**: Latest value is worse than the 3-period moving average
- **Flat**: Change is within ±2% threshold

### Velocity
- **Accelerating**: The rate of change is increasing period over period
- **Decelerating**: The rate of change is decreasing
- **Stable**: The rate of change is roughly constant

This allows leadership to answer: "Are we getting better or worse, and is the trend speeding up or slowing down?"

## Calculation Pipeline

```
Raw Data (GitHub, Jira, PagerDuty)
  → Connectors (collect/transform/validate)
    → BullMQ KPI Calculator Job
      → KPI Snapshot (value + breakdown + health level)
        → Shift Calculator (direction + velocity)
          → Insight Generator (correlations, anomalies, hotspots)
```

## Severity-Weighted Variants

### Defect Escape Rate
The base metric is a simple percentage. The severity-weighted variant applies multipliers:
- Critical defects: ×3
- Major defects: ×2
- Minor defects: ×1

### MTTRC
Median is used instead of mean to avoid outlier distortion. Incidents with unknown root cause are flagged and count negatively against the metric.

## Insight Generation

The quality score drives automated insight generation:

1. **Correlation Detection**: Pearson r across KPI pairs (|r| > 0.7 triggers an insight)
2. **Anomaly Detection**: Rolling 30-day mean ± 2σ for spike detection
3. **Hotspot Detection**: Team outliers exceeding org average + 10 percentage points

Example insight: "Cycle time improved 18% this quarter, but defect escape rate rose 3pp. Faster reviews may be less thorough."

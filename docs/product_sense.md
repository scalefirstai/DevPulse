# Product Sense

## Why DevPulse Exists

Traditional engineering metrics are broken. Sprint velocity, story points, and bug counts are **vanity metrics** — they measure activity, not outcomes. A team shipping 200 story points per sprint can still have:
- 14-day cycle times
- 20% defect escape rates
- Architecture rotting under the surface
- Incidents where nobody finds the root cause

DevPulse replaces these with five outcome-oriented KPIs that answer the question: **"Is our engineering organization actually getting better at building software?"**

## Target Users

### Primary: Engineering Leadership (VPE, CTO, Directors)
- Need a single health score to understand organizational state
- Want trend analysis, not just snapshots
- Need to identify which teams need help and why
- Must present engineering health to the C-suite

### Secondary: Engineering Managers
- Need team-level KPI visibility
- Want to compare their team against org baselines
- Need automated insight generation to surface problems early
- Use shift tracking to measure improvement initiatives

### Tertiary: Staff/Principal Engineers
- Care about architectural drift detection
- Want data-driven arguments for tech debt investment
- Use rework analysis to identify systemic quality issues

## What Makes DevPulse Different

### 1. Outcome Metrics, Not Activity Metrics
We don't measure velocity, throughput, or commit frequency. We measure the things that actually predict whether software gets better over time.

### 2. Automated Insight Generation
This is not just another dashboard. The insight engine detects correlations ("Cycle time improved but defect escape rate rose — faster reviews may be less thorough"), anomalies ("MTTRC spiked 3σ above the 30-day average"), and hotspots ("Team X rework at 42% — highest across all teams").

### 3. Shift Tracking
Static dashboards show "where you are." DevPulse shows "where you're heading." Direction (improving/declining/flat) + velocity (accelerating/decelerating/stable) answer: "Are we getting better, and is the improvement speeding up or slowing down?"

### 4. Architecture as a First-Class KPI
Most engineering metrics tools ignore architecture. DevPulse treats architectural drift as a core health indicator, not an afterthought. It integrates with ArchUnit, jDepend, and CI fitness functions.

### 5. Root Cause, Not Just Resolution
MTTRC (Mean Time to Root Cause) is different from MTTR (Mean Time to Resolve). Resolving an incident by restarting a service is not the same as understanding why it failed. DevPulse tracks the distinction.

## Design Principles

### Dark-First UI
Engineering tools should look like engineering tools. The dashboard defaults to a dark theme (slate-900) because that's what engineers and engineering dashboards actually use. Wall-mounted TVs in the office, developer workstations, executive tablets at night — all benefit from dark mode.

### Demo Mode is Critical
Nobody evaluates a metrics tool by reading docs. They evaluate it by seeing the dashboard with data. `docker-compose up` must show a fully-populated dashboard with 4 teams, 6 months of data, mixed health levels, and pre-generated insights.

### Health Tiers, Not Raw Numbers
Raw KPI values are meaningless without context. "Cycle time is 3.2 days" means nothing. "Cycle time is Strong (3.2 days)" instantly communicates health. The four tiers (Elite/Strong/Moderate/Alert) are the primary visual language.

### Insights Over Data
Showing five charts is not the product. The product is the sentence: "Cycle time improved 18% this quarter, but defect escape rate rose 3 points. Faster reviews may be less thorough." Data informs; insights drive action.

## Non-Goals

DevPulse is **not**:
- An APM tool (doesn't collect traces or logs)
- A project management tool (doesn't replace Jira)
- A CI/CD tool (doesn't run builds)
- An incident management tool (doesn't page anyone)
- An individual performance tracker (measures systems, not people)

It's **infrastructure for understanding engineering health** — the layer that sits on top of existing tools and tells you whether your organization is actually getting better at building software.

## Adoption Strategy

### For Open-Source Adoption
1. **Zero-config demo**: `docker-compose up` shows value in 30 seconds
2. **Gradual connector setup**: Start with GitHub only, add Jira/PagerDuty later
3. **Sensible defaults**: Thresholds pre-configured based on industry benchmarks
4. **Custom connector SDK**: Organizations can integrate proprietary data sources

### For Organizational Adoption
1. **Start with one team**: Deploy for a pilot team, prove value with trend data
2. **Show, don't tell**: The insight engine generates talking points for leadership
3. **Non-punitive framing**: Health tiers, not leaderboards. "Alert" means the team needs help, not punishment
4. **Configurable thresholds**: Teams can set realistic targets for their context

## Key Product Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Median over mean | Median for Cycle Time and MTTRC | Outliers distort mean; median reflects typical experience |
| 21-day rework window | Configurable, default 21 days | Aligns with typical sprint cadence; shorter windows miss refactors |
| 4-tier health levels | Elite/Strong/Moderate/Alert | Enough granularity to be useful, not so many that tiers blur |
| Equal KPI weights | Default 1.0 each | Organizations customize weights via config |
| Pearson correlation | r > 0.7 threshold for insights | Strong enough to be actionable, not so strict it misses patterns |
| 2σ anomaly threshold | Rolling 30-day window | Industry standard; 30 days provides enough sample for stability |

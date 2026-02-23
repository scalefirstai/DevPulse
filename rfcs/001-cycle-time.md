# RFC 001 — Cycle Time

**Status:** Draft
**KPI:** Cycle Time
**Last updated:** 2026-02-22

## Summary

Cycle Time measures how long it takes for work to go from first commit to production. It's the most intuitive delivery speed metric — but defining its boundaries involves real trade-offs.

## Current Definition

**Formula:** Median time from first commit to production deploy across all merged PRs in the period.

**Phases:** Ideation → Coding → Review → Deploy

**Default Thresholds:**

| Tier | `kpi-definitions.md` | `quality_score.md` | `README.md` |
|------|----------------------|---------------------|-------------|
| Elite | ≤ 3 days | ≤ 1 day | < 2 days |
| Strong | ≤ 7 days | ≤ 3 days | — |
| Moderate | ≤ 14 days | ≤ 14 days | — |
| Alert | > 14 days | > 14 days | > 14 days |

> **Note:** The thresholds are inconsistent across our own docs. Resolving this is one of the open questions below.

## Rationale

Cycle Time was chosen over throughput-based metrics (PRs/week, commits/day) because it measures elapsed time from the engineer's perspective. A team shipping 50 PRs a week with a 14-day median cycle time has a flow problem, regardless of raw output.

Median is used instead of mean because a single 30-day PR shouldn't distort the picture of how work typically flows. This aligns with the design principle of measuring typical experience, not averages pulled by outliers (see `docs/product_sense.md`).

The four-phase breakdown (Ideation → Coding → Review → Deploy) exists so teams can identify *where* time is spent, not just how much.

## Open Questions

### 1. What is the start point?

The current definition says "first commit." But this misses time spent before the first commit — branch creation, local experimentation, design spikes. Should the clock start at:

- **First commit** (current) — easy to measure, but ignores pre-coding time
- **Branch creation** — captures more of the real timeline, but many workflows don't create branches immediately
- **Issue assignment** — captures the full cycle, but mixes coding speed with prioritization delays

### 2. How should draft PRs and stacked PRs be treated?

Draft PRs signal work-in-progress. Should the clock keep running while a PR is in draft? If a team uses stacked PRs (PR depends on PR), should cycle time be measured per-PR or for the full stack?

### 3. Should weekends and holidays be excluded?

A PR opened Friday afternoon and merged Monday morning shows as a 3-day cycle time. Is that meaningful? Options:

- **Calendar time** (current) — simple, consistent, but penalizes weekend-adjacent work
- **Business days only** — more "fair" but adds complexity and varies by locale
- **Configurable** — let teams choose, but makes cross-team comparison harder

### 4. What should the Elite threshold actually be?

Our own docs disagree: ≤ 1 day, < 2 days, and ≤ 3 days all appear as "Elite." The DORA research uses < 1 day for Elite performers. What's the right target for DevPulse?

- Should thresholds align with DORA benchmarks?
- Should they be more generous since DevPulse measures median rather than a distribution?
- Should there be a single canonical threshold set, or are different contexts valid?

## How to Weigh In

- **Edit this RFC** — open a PR against `rfcs/001-cycle-time.md` with your proposed changes
- **Discuss** — start a thread in [GitHub Discussions](https://github.com/scalefirstai/DevPulse/discussions) tagged `methodology`
- **Share data** — if your team has measured cycle time differently and learned something, we want to hear about it

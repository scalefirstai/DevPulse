# RFC 004 — MTTRC (Mean Time to Root Cause)

**Status:** Draft
**KPI:** MTTRC
**Last updated:** 2026-02-22

## Summary

MTTRC measures the median time from incident detection to confirmed root cause identification. It's deliberately different from MTTR (Mean Time to Resolve) — resolving an incident by restarting a service is not the same as understanding *why* it failed.

## Current Definition

**Formula:** Median time from incident detection to confirmed root cause identification.

Tracks incidents with severity P1–P4 and root cause method (observability, log analysis, code review, brute force).

**Default Thresholds:**

| Tier | `kpi-definitions.md` | `quality_score.md` | `README.md` |
|------|----------------------|---------------------|-------------|
| Elite | ≤ 2 hours | ≤ 1 hour | < 1 hour |
| Strong | ≤ 4 hours | ≤ 4 hours | — |
| Moderate | ≤ 8 hours | ≤ 24 hours | — |
| Alert | > 8 hours | > 24 hours | > 8 hours |

> **Note:** The Elite threshold ranges from < 1 hour to ≤ 2 hours, and Moderate ranges from ≤ 8 hours to ≤ 24 hours across docs.

**Statistical note:** Median is used instead of mean to avoid outlier distortion. Incidents with unknown root cause are flagged and count negatively against the metric.

## Rationale

MTTRC was chosen over MTTR because resolution without understanding is a false signal. A team that restarts services to "resolve" incidents quickly will have excellent MTTR but no idea why things are breaking. MTTRC forces teams to invest in observability, logging, and diagnostic capability.

Tracking the root cause *method* (observability, log analysis, code review, brute force) provides insight into diagnostic maturity. Teams that rely on brute force are less resilient than teams with strong observability.

The "root cause, not just resolution" principle is a core DevPulse differentiator (see `docs/product_sense.md`).

## Open Questions

### 1. MTTRC vs MTTR — is root cause always the right target?

The premise of MTTRC is that root cause identification is more valuable than quick resolution. But there are counterarguments:

- Some incidents are genuinely best resolved without root cause analysis (e.g., transient cloud issues)
- Root cause can be identified *after* resolution without impacting users
- MTTR is the industry standard (DORA uses it); MTTRC is less comparable

Should DevPulse track both and let teams choose their primary, or commit to MTTRC as the opinionated choice?

### 2. Should P4 incidents be included?

The current definition tracks P1–P4 severity. But P4 incidents (low-impact, cosmetic, minor degradation) can dilute the metric:

- A team with 50 P4 incidents (root cause found in 20 minutes each) and 2 P1 incidents (root cause found in 12 hours) would show a median around 20 minutes — masking the P1 problem
- Excluding P4 focuses the metric on incidents that actually matter
- Including P4 rewards teams for investigating even minor issues

### 3. How should incidents with no identified root cause be handled?

The current approach flags unknown-root-cause incidents and counts them "negatively." But what does that mean concretely?

- **Exclude from median, track separately** — doesn't penalize the metric, but hides a problem
- **Count as maximum value (e.g., 720 hours)** — heavily penalizes, but may be disproportionate
- **Count as the worst tier threshold** — penalizes but doesn't distort the median as dramatically
- **Track a separate "root cause identification rate"** — complementary metric showing what percentage of incidents reach confirmed root cause

### 4. How should external dependency failures be scoped?

When the root cause is "AWS us-east-1 had an outage," the team's diagnostic speed is constrained by the cloud provider's communication timeline. Should these be:

- **Included as-is** — the metric reflects reality, including things outside your control
- **Excluded** — only measure incidents where the root cause is within the team's domain
- **Capped** — count external dependency incidents but cap their MTTRC contribution at some threshold
- **Tagged and filterable** — include in the default metric but allow filtering for "internal-only" MTTRC

## How to Weigh In

- **Edit this RFC** — open a PR against `rfcs/004-mttrc.md` with your proposed changes
- **Discuss** — start a thread in [GitHub Discussions](https://github.com/scalefirstai/DevPulse/discussions) tagged `methodology`
- **Share data** — if your team has measured MTTRC or MTTR and has opinions on these trade-offs, we want to hear about it

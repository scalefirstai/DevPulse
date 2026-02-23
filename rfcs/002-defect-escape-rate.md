# RFC 002 — Defect Escape Rate

**Status:** Draft
**KPI:** Defect Escape Rate
**Last updated:** 2026-02-22

## Summary

Defect Escape Rate measures the percentage of defects that reach production rather than being caught earlier in the pipeline. It's a quality gate metric — the lower the rate, the more effective your pre-deployment testing and review.

## Current Definition

**Formula:** `(escaped_defects / total_defects) × 100`

Escaped defects are those found in production rather than pre-deployment stages.

**Default Thresholds:**

| Tier | `kpi-definitions.md` | `quality_score.md` | `README.md` |
|------|----------------------|---------------------|-------------|
| Elite | ≤ 2% | ≤ 5% | < 5% |
| Strong | ≤ 5% | ≤ 10% | — |
| Moderate | ≤ 10% | ≤ 20% | — |
| Alert | > 10% | > 20% | > 25% |

> **Note:** Thresholds vary significantly across docs — Elite ranges from 2% to 5%, and Alert from >10% to >25%.

**Severity-Weighted Variant:**

The base metric is a simple percentage. A severity-weighted variant applies multipliers:
- Critical defects: ×3
- Major defects: ×2
- Minor defects: ×1

## Rationale

Defect Escape Rate was chosen because it measures quality *outcomes*, not quality *activity*. A team with 95% test coverage can still have a high escape rate if the tests don't cover the right things. Conversely, a team with modest coverage but excellent code review might catch everything that matters.

The metric intentionally doesn't prescribe *how* to prevent escapes — it just measures whether you do. Teams can invest in testing, code review, static analysis, or staging environments and the metric reflects the result regardless of approach.

## Open Questions

### 1. Should severity weighting be the default?

The current implementation offers severity weighting as an opt-in variant. But a Critical production defect that takes down the site is categorically different from a cosmetic Minor bug. Arguments:

- **Simple count (current default)** — easier to understand, no classification debates
- **Severity-weighted by default** — better reflects real impact, but requires consistent severity classification
- **Configurable with a recommended default** — pragmatic, but which default?

### 2. Should integration failures be weighted differently from requirements gaps?

A defect where "the feature works but not what the customer wanted" (requirements gap) is different from "the feature crashes under load" (integration failure). The current `rework_reasons` taxonomy tracks `bug_fix` vs `requirement_change`, but this distinction isn't reflected in defect escape rate.

### 3. How should flaky tests be classified?

Flaky tests that intermittently pass can mask real defects. If a genuine bug passes CI because a flaky test happened to pass, should the resulting production defect be treated differently? This is hard to detect automatically but represents a real gap in the metric.

### 4. What counts as "escaped" in production-like environments?

If a team has a staging environment that mirrors production closely, should defects caught in staging count as "escaped"? The current definition draws the line at production, but:

- Some teams treat staging as a production-equivalent gate
- Defects caught in canary deployments are technically "in production" but caught early
- Feature flag rollouts blur the line between staged and deployed

## How to Weigh In

- **Edit this RFC** — open a PR against `rfcs/002-defect-escape-rate.md` with your proposed changes
- **Discuss** — start a thread in [GitHub Discussions](https://github.com/scalefirstai/DevPulse/discussions) tagged `methodology`
- **Share data** — if your team has measured defect escape rate and learned something about these trade-offs, we want to hear about it

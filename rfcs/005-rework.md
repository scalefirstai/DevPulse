# RFC 005 — Rework

**Status:** Draft
**KPI:** Rework
**Last updated:** 2026-02-22

## Summary

Rework measures the percentage of PRs that modify files recently changed by another PR. It's a proxy for quality and planning effectiveness — high rework suggests that work is being done, undone, and redone rather than getting it right the first time.

## Current Definition

**Formula:** `(rework_prs / total_prs) × 100`

A PR is considered rework if it modifies files that were changed in another PR within the last 21 days (configurable).

**Rework Reasons:** `bug_fix`, `requirement_change`, `refactor`, `scope_creep`

**Default Thresholds:**

| Tier | `kpi-definitions.md` | `quality_score.md` | `README.md` |
|------|----------------------|---------------------|-------------|
| Elite | ≤ 5% | ≤ 10% | < 10% |
| Strong | ≤ 10% | ≤ 20% | — |
| Moderate | ≤ 15% | ≤ 35% | — |
| Alert | > 15% | > 35% | > 30% |

> **Note:** Thresholds vary significantly — Elite ranges from 5% to 10%, and Alert from >15% to >35%.

## Rationale

Rework was chosen because it measures a specific form of waste: effort spent re-doing work that was recently done. This is different from measuring velocity or throughput — a team can have high throughput while spending 40% of it on rework, meaning they're running fast but in circles.

The 21-day default window was chosen to align with a typical sprint cadence. Changes to the same files within a sprint are likely related to the same feature or bug, making overlapping edits a signal of incomplete work rather than natural evolution.

Tracking rework *reasons* (`bug_fix`, `requirement_change`, `refactor`, `scope_creep`) matters because not all rework is equal. Bug-fix rework indicates quality problems. Requirement-change rework indicates planning problems. Refactor rework might be intentional improvement.

## Open Questions

### 1. Is 21 days the right default window?

The 21-day window aligns with a 3-week sprint but is arbitrary for teams that operate differently:

- **Shorter window (7–14 days)** — more sensitive to rapid iteration, but misses slower rework cycles
- **Longer window (30–42 days)** — catches more rework, but starts including natural feature evolution
- **Adaptive window** — base it on the team's actual release cadence rather than a fixed number

The `docs/product_sense.md` notes that "shorter windows miss refactors." Is the risk of missing rework worse than the risk of over-counting natural changes?

### 2. Should planned refactors count as rework?

The rework reasons include `refactor`, but a planned, deliberate refactoring PR that touches recently changed files is fundamentally different from an unplanned bug fix. Options:

- **Count all file overlaps equally (current)** — simple, but penalizes intentional improvement
- **Exclude `refactor`-tagged rework** — requires honest tagging (creates gaming incentive)
- **Weight by reason** — `bug_fix` and `scope_creep` count fully, `refactor` and `requirement_change` count at 50%
- **Track separately** — show total rework and "unplanned rework" as distinct metrics

### 3. File-level vs function-level granularity

The current metric operates at file level: if a PR touches a file that was changed in the last 21 days, it's rework. But a 2,000-line file might have dozens of independent concerns. Two PRs touching different functions in the same file aren't necessarily rework.

- **File-level (current)** — simple, works with any git history, but over-counts in large files
- **Function-level** — more accurate, but requires language-specific parsing
- **Hunk-level** — use git diff hunks to detect actual overlapping changes
- **Hybrid** — file-level by default with opt-in function-level for supported languages

### 4. Should dependency-update-driven rework be excluded?

When a dependency update (e.g., Renovate/Dependabot PR) touches `package.json` or lock files, and a subsequent PR also touches those files, it registers as rework. But this is routine maintenance, not quality waste. Similarly, generated files (migrations, GraphQL codegen) can inflate rework counts.

Should DevPulse support configurable file exclusion patterns for the rework calculation?

## How to Weigh In

- **Edit this RFC** — open a PR against `rfcs/005-rework.md` with your proposed changes
- **Discuss** — start a thread in [GitHub Discussions](https://github.com/scalefirstai/DevPulse/discussions) tagged `methodology`
- **Share data** — if your team has measured rework and has opinions on window size, granularity, or exclusions, we want to hear about it

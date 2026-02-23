# KPI Definitions

## Cycle Time

**Formula**: Median time from first commit to production deploy across all merged PRs in the period.

**Phases**: Ideation → Coding → Review → Deploy

**Default Thresholds**:
| Tier | Max Value |
|------|-----------|
| Elite | ≤ 3 days |
| Strong | ≤ 7 days |
| Moderate | ≤ 14 days |
| Alert | > 14 days |

## Defect Escape Rate

**Formula**: `(escaped_defects / total_defects) × 100`

Escaped defects are those found in production rather than pre-deployment stages.

**Default Thresholds**:
| Tier | Max Value |
|------|-----------|
| Elite | ≤ 2% |
| Strong | ≤ 5% |
| Moderate | ≤ 10% |
| Alert | > 10% |

## Architecture Drift

**Formula**: `(active_violations / total_rules) × 100`

Measures the gap between intended and actual architecture based on defined rules.

**Default Thresholds**:
| Tier | Max Value |
|------|-----------|
| Elite | ≤ 2% |
| Strong | ≤ 5% |
| Moderate | ≤ 10% |
| Alert | > 10% |

## MTTRC (Mean Time to Root Cause)

**Formula**: Median time from incident detection to confirmed root cause identification.

Tracks incidents with severity P1-P4 and root cause method (observability, log analysis, code review, brute force).

**Default Thresholds**:
| Tier | Max Value |
|------|-----------|
| Elite | ≤ 2 hours |
| Strong | ≤ 4 hours |
| Moderate | ≤ 8 hours |
| Alert | > 8 hours |

## Rework

**Formula**: `(rework_prs / total_prs) × 100`

A PR is considered rework if it modifies files that were changed in another PR within the last 21 days (configurable).

**Rework Reasons**: bug_fix, requirement_change, refactor, scope_creep

**Default Thresholds**:
| Tier | Max Value |
|------|-----------|
| Elite | ≤ 5% |
| Strong | ≤ 10% |
| Moderate | ≤ 15% |
| Alert | > 15% |

## Health Score

Composite 0-100 score computed from the 5 KPI tier classifications:
- Elite = 100 points
- Strong = 75 points
- Moderate = 50 points
- Alert = 25 points

Final score = weighted average across all 5 KPIs (equal weight by default).

## Shift Tracking

Each KPI tracks **direction** and **velocity** using a 3-period moving average:
- **Direction**: Improving / Declining / Flat
- **Velocity**: Accelerating / Decelerating / Stable

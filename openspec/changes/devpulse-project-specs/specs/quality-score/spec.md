## ADDED Requirements

### Requirement: Cycle time calculation
The system SHALL calculate cycle time as the median elapsed time from idea to production for all PRs merged in a given period. The calculation SHALL break down into four phases: ideation (issue created → first commit), coding (first commit → first review), review (first review → approved), and deploy (merged → deployed). The output unit SHALL be days.

#### Scenario: Median cycle time for a period
- **WHEN** a team has 10 PRs merged in a 2-week period with cycle times [1, 2, 2, 3, 3, 4, 5, 7, 10, 14] days
- **THEN** the calculated cycle time is 3.5 days (median of the set)

#### Scenario: Phase breakdown
- **WHEN** a PR has first_commit_at, first_review_at, approved_at, merged_at, and deployed_at timestamps
- **THEN** each phase duration is calculated as the difference between consecutive timestamps

#### Scenario: Missing issue linkage
- **WHEN** a PR has no linked Jira issue (issue_created_at is null)
- **THEN** cycle time starts from first_commit_at instead of issue creation

### Requirement: Defect escape rate calculation
The system SHALL calculate defect escape rate as the percentage of total defects that were found in production. The formula SHALL be `(escaped_count / total_count) * 100`. The system SHALL also compute a severity-weighted variant and provide breakdowns by severity (critical, major, minor) and category (logic_error, integration, config_drift, requirements_gap).

#### Scenario: Basic escape rate
- **WHEN** a team has 20 total defects in a period and 4 were found in production
- **THEN** the defect escape rate is 20%

#### Scenario: Severity breakdown
- **WHEN** escaped defects include 1 critical, 2 major, and 1 minor
- **THEN** the breakdown shows counts and percentages per severity level

#### Scenario: Zero defects in period
- **WHEN** a team has zero defects recorded in a period
- **THEN** the defect escape rate is reported as 0% (not an error)

### Requirement: Architectural drift calculation
The system SHALL calculate architectural drift as the percentage of active (unresolved) violations relative to total defined architectural rules. The formula SHALL be `(active_violations / total_rules) * 100`. The system SHALL also compute velocity: `(current_violations - prev_violations) / prev_violations`, classified as accelerating, decelerating, or stable.

#### Scenario: Drift percentage
- **WHEN** there are 50 architectural rules defined and 5 have active violations
- **THEN** the architectural drift is 10%

#### Scenario: Drift velocity
- **WHEN** the previous period had 3 active violations and the current period has 5
- **THEN** the velocity is +66.7% and classified as "accelerating"

#### Scenario: No rules defined
- **WHEN** no architectural rules have been scanned
- **THEN** the architectural drift is reported as 0% with a flag indicating no rules are configured

### Requirement: Mean time to root cause calculation
The system SHALL calculate MTTRC as the median time in hours from incident detection to root cause identification (`root_cause_at - detected_at`). Incidents where root_cause_at is NULL SHALL be flagged as "root cause unknown" and counted against the metric. The output SHALL include the median MTTRC, percentage of incidents with unknown root cause, and breakdown by root_cause_method (observability, log_analysis, code_review, brute_force).

#### Scenario: Median MTTRC
- **WHEN** a team has 5 incidents with root cause times of [0.5, 1, 2, 4, 8] hours
- **THEN** the MTTRC is 2 hours

#### Scenario: Unknown root cause
- **WHEN** 3 out of 10 incidents have no root_cause_at timestamp
- **THEN** the output includes "30% unknown root cause" and those incidents are excluded from the median calculation but flagged separately

#### Scenario: Root cause method breakdown
- **WHEN** incidents are resolved via observability (3), log_analysis (4), code_review (2), brute_force (1)
- **THEN** the breakdown shows counts and percentages per method

### Requirement: Rework percentage calculation
The system SHALL calculate rework percentage as the proportion of PRs in a period that modify files also changed in a PR merged within the prior 21 days. The formula SHALL be `(rework_prs / total_prs) * 100`. The rework window (default 21 days) SHALL be configurable. Rework PRs SHALL be categorized by reason: bug_fix, requirement_change, refactor, or scope_creep.

#### Scenario: Basic rework percentage
- **WHEN** 30 PRs are merged in a period and 6 of them touch files modified within the prior 21 days
- **THEN** the rework percentage is 20%

#### Scenario: Configurable window
- **WHEN** the rework window is configured to 14 days instead of the default 21
- **THEN** only PRs touching files changed within 14 days are counted as rework

#### Scenario: Rework reason breakdown
- **WHEN** 6 rework PRs are categorized as bug_fix (3), requirement_change (1), refactor (1), scope_creep (1)
- **THEN** the breakdown shows each category with count and percentage

### Requirement: Composite health score
The system SHALL compute a composite health score from 0 to 100 for each team by aggregating all five KPI values. Each KPI SHALL be classified into one of four tiers — Elite, Strong, Moderate, Alert — based on configurable thresholds. The composite score SHALL weight all five KPIs and map tier classifications to numeric ranges.

#### Scenario: Health score calculation
- **WHEN** a team has cycle_time=2d (Elite), defect_escape=8% (Strong), arch_drift=4% (Strong), mttrc=2h (Strong), rework=12% (Strong)
- **THEN** the composite health score reflects 1 Elite + 4 Strong ratings as a score between 75-90

#### Scenario: Tier classification with default thresholds
- **WHEN** using default thresholds and cycle time is 5 days
- **THEN** the classification is "Moderate" (between strong_max=3 and moderate_max=14)

#### Scenario: Custom thresholds per team
- **WHEN** a team has custom thresholds with cycle_time elite_max=2
- **THEN** those thresholds override the org-wide defaults for that team's health scoring

### Requirement: Threshold configuration
The system SHALL store threshold values per KPI type in the `thresholds` table with columns: `elite_max`, `strong_max`, `moderate_max`. Any value above `moderate_max` SHALL be classified as "Alert". Thresholds SHALL support team-specific overrides (non-NULL team_id) falling back to org-wide defaults (NULL team_id). Default thresholds SHALL be: cycle_time (1/3/14 days), defect_escape (5/10/20 %), arch_drift (2/5/15 %), mttrc (1/4/24 hours), rework (10/20/35 %).

#### Scenario: Org-wide default thresholds
- **WHEN** no team-specific thresholds are configured for a team
- **THEN** the org-wide defaults (team_id=NULL) are used for classification

#### Scenario: Team-specific override
- **WHEN** a team has a custom threshold row for cycle_time with elite_max=0.5
- **THEN** that team's cycle time classification uses 0.5/strong_max/moderate_max instead of the org defaults

### Requirement: Shift tracking
The system SHALL compute shift direction and velocity for each KPI per team. Shift percentage SHALL be `((current - previous) / previous) * 100`. Direction SHALL be classified as "improving", "declining", or "flat" (if |shift_pct| < 2%). Velocity SHALL be derived from a 3-period moving average and classified as "accelerating", "decelerating", or "stable".

#### Scenario: Improving shift
- **WHEN** a team's cycle time drops from 5 days to 3 days
- **THEN** the shift is -40% with direction "improving" (lower is better for cycle time)

#### Scenario: Flat shift
- **WHEN** a team's defect escape rate goes from 10% to 10.1%
- **THEN** the shift is +1% with direction "flat" (below 2% threshold)

#### Scenario: Accelerating velocity
- **WHEN** the shift percentages over the last 3 periods are [-5%, -10%, -18%]
- **THEN** the velocity is classified as "accelerating" (improving at an increasing rate)

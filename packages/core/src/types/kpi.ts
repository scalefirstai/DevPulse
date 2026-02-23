export enum HealthLevel {
  Elite = 'elite',
  Strong = 'strong',
  Moderate = 'moderate',
  Alert = 'alert',
}

export enum KpiType {
  CycleTime = 'cycle_time',
  DefectEscape = 'defect_escape',
  ArchDrift = 'arch_drift',
  Mttrc = 'mttrc',
  Rework = 'rework',
}

export enum ShiftDirection {
  Improving = 'improving',
  Declining = 'declining',
  Flat = 'flat',
}

export enum ShiftVelocity {
  Accelerating = 'accelerating',
  Decelerating = 'decelerating',
  Stable = 'stable',
}

export interface KpiSnapshot {
  id: string;
  teamId: string;
  kpiType: KpiType;
  value: number;
  unit: string;
  periodStart: Date;
  periodEnd: Date;
  breakdown: Record<string, unknown>;
  healthLevel: HealthLevel;
  createdAt: Date;
}

export interface CycleTimeBreakdown {
  ideation: number;
  coding: number;
  review: number;
  deploy: number;
}

export interface CycleTimeResult {
  median: number;
  unit: 'days';
  breakdown: CycleTimeBreakdown;
  sampleSize: number;
}

export interface DefectBreakdownBySeverity {
  critical: number;
  major: number;
  minor: number;
}

export interface DefectBreakdownByCategory {
  logic_error: number;
  integration: number;
  config_drift: number;
  requirements_gap: number;
}

export interface DefectEscapeResult {
  rate: number;
  unit: 'percent';
  escapedCount: number;
  totalCount: number;
  severityBreakdown: DefectBreakdownBySeverity;
  categoryBreakdown: DefectBreakdownByCategory;
}

export interface ArchDriftResult {
  driftPercent: number;
  unit: 'percent';
  activeViolations: number;
  totalRules: number;
  velocity: number;
  velocityLabel: 'accelerating' | 'decelerating' | 'stable';
}

export interface MttrcBreakdownByMethod {
  observability: number;
  log_analysis: number;
  code_review: number;
  brute_force: number;
}

export interface MttrcResult {
  median: number;
  unit: 'hours';
  unknownRootCausePercent: number;
  methodBreakdown: MttrcBreakdownByMethod;
  sampleSize: number;
}

export interface ReworkBreakdownByReason {
  bug_fix: number;
  requirement_change: number;
  refactor: number;
  scope_creep: number;
}

export interface ReworkResult {
  reworkPercent: number;
  unit: 'percent';
  reworkPrs: number;
  totalPrs: number;
  reasonBreakdown: ReworkBreakdownByReason;
}

export interface HealthScoreResult {
  score: number;
  tiers: Record<KpiType, HealthLevel>;
}

export interface ShiftResult {
  kpiType: KpiType;
  shiftPercent: number;
  direction: ShiftDirection;
  velocity: ShiftVelocity;
}

export interface PrEvent {
  id: string;
  teamId: string;
  externalId: string;
  title: string;
  author: string;
  createdAt: Date;
  firstCommitAt: Date | null;
  firstReviewAt: Date | null;
  approvedAt: Date | null;
  mergedAt: Date | null;
  deployedAt: Date | null;
  isRework: boolean;
  reworkReason: string | null;
  filesChanged: number;
  additions: number;
  deletions: number;
  labels: string[];
}

export interface Defect {
  id: string;
  teamId: string;
  externalId: string;
  severity: 'critical' | 'major' | 'minor';
  foundIn: string;
  escaped: boolean;
  category: string | null;
  createdAt: Date;
  resolvedAt: Date | null;
}

export interface Incident {
  id: string;
  teamId: string;
  externalId: string;
  severity: 'p1' | 'p2' | 'p3' | 'p4';
  title: string;
  detectedAt: Date;
  mitigatedAt: Date | null;
  rootCauseAt: Date | null;
  resolvedAt: Date | null;
  rootCauseMethod: string | null;
  rootCauseDescription: string | null;
  isRecurring: boolean;
  recurrenceOf: string | null;
}

export interface ArchViolation {
  id: string;
  teamId: string;
  ruleName: string;
  violationType: string;
  sourceComponent: string;
  targetComponent: string;
  filePath: string;
  firstDetectedAt: Date;
  resolvedAt: Date | null;
  scanSource: string;
}

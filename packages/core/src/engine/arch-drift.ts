import { ArchDriftResult, ArchViolation } from '../types/kpi.js';

export interface ArchDriftInput {
  violations: ArchViolation[];
  previousActiveViolations?: number;
}

export function calculateArchDrift(input: ArchDriftInput): ArchDriftResult {
  const { violations, previousActiveViolations } = input;

  const activeViolations = violations.filter((v) => v.resolvedAt === null).length;
  const totalRules = new Set(violations.map((v) => v.ruleName)).size;
  const driftPercent = totalRules === 0 ? 0 : (activeViolations / totalRules) * 100;

  let velocity = 0;
  let velocityLabel: 'accelerating' | 'decelerating' | 'stable' = 'stable';

  if (previousActiveViolations !== undefined && previousActiveViolations > 0) {
    velocity = ((activeViolations - previousActiveViolations) / previousActiveViolations) * 100;
    if (velocity > 5) {
      velocityLabel = 'accelerating';
    } else if (velocity < -5) {
      velocityLabel = 'decelerating';
    } else {
      velocityLabel = 'stable';
    }
  }

  return {
    driftPercent,
    unit: 'percent',
    activeViolations,
    totalRules,
    velocity,
    velocityLabel,
  };
}

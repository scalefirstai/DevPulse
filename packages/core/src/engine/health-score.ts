import { HealthLevel, HealthScoreResult, KpiType } from '../types/kpi.js';
import { ThresholdMap, DEFAULT_THRESHOLDS } from '../types/config.js';
import { classifyHealthLevel } from '../utils/thresholds.js';

const TIER_SCORES: Record<HealthLevel, number> = {
  [HealthLevel.Elite]: 100,
  [HealthLevel.Strong]: 75,
  [HealthLevel.Moderate]: 50,
  [HealthLevel.Alert]: 25,
};

const KPI_WEIGHTS: Record<KpiType, number> = {
  [KpiType.CycleTime]: 1,
  [KpiType.DefectEscape]: 1,
  [KpiType.ArchDrift]: 1,
  [KpiType.Mttrc]: 1,
  [KpiType.Rework]: 1,
};

export function calculateHealthScore(
  kpiValues: Record<KpiType, number>,
  thresholds: ThresholdMap = DEFAULT_THRESHOLDS,
): HealthScoreResult {
  const tiers: Record<KpiType, HealthLevel> = {} as Record<KpiType, HealthLevel>;
  let weightedSum = 0;
  let totalWeight = 0;

  for (const kpiType of Object.values(KpiType)) {
    const value = kpiValues[kpiType];
    const threshold = thresholds[kpiType];
    const tier = classifyHealthLevel(value, threshold);
    tiers[kpiType] = tier;

    const weight = KPI_WEIGHTS[kpiType];
    weightedSum += TIER_SCORES[tier] * weight;
    totalWeight += weight;
  }

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  return { score, tiers };
}

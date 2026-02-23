import { HealthLevel, KpiType } from '../types/kpi.js';
import { ThresholdConfig, ThresholdMap, DEFAULT_THRESHOLDS } from '../types/config.js';

export function classifyHealthLevel(value: number, threshold: ThresholdConfig): HealthLevel {
  if (value <= threshold.eliteMax) return HealthLevel.Elite;
  if (value <= threshold.strongMax) return HealthLevel.Strong;
  if (value <= threshold.moderateMax) return HealthLevel.Moderate;
  return HealthLevel.Alert;
}

export function getThresholdForKpi(
  kpiType: KpiType,
  teamThresholds?: Partial<ThresholdMap>,
  orgThresholds?: Partial<ThresholdMap>,
): ThresholdConfig {
  return (
    teamThresholds?.[kpiType] ?? orgThresholds?.[kpiType] ?? DEFAULT_THRESHOLDS[kpiType]
  );
}

import { describe, it, expect } from 'vitest';
import { calculateHealthScore } from '../src/engine/health-score';
import { KpiType, HealthLevel } from '../src/types/kpi';
import { DEFAULT_THRESHOLDS, ThresholdMap } from '../src/types/config';

describe('calculateHealthScore', () => {
  it('should compute composite score: 1 Elite + 4 Strong => score of 80', () => {
    // Default thresholds:
    //   CycleTime:    eliteMax=1, strongMax=3, moderateMax=14
    //   DefectEscape: eliteMax=5, strongMax=10, moderateMax=20
    //   ArchDrift:    eliteMax=2, strongMax=5, moderateMax=15
    //   Mttrc:        eliteMax=1, strongMax=4, moderateMax=24
    //   Rework:       eliteMax=10, strongMax=20, moderateMax=35

    const kpiValues: Record<KpiType, number> = {
      [KpiType.CycleTime]: 0.5,   // Elite (<=1)
      [KpiType.DefectEscape]: 8,   // Strong (<=10)
      [KpiType.ArchDrift]: 4,      // Strong (<=5)
      [KpiType.Mttrc]: 3,          // Strong (<=4)
      [KpiType.Rework]: 15,        // Strong (<=20)
    };

    const result = calculateHealthScore(kpiValues);

    // 1 Elite (100) + 4 Strong (75 each) = 100 + 300 = 400 / 5 = 80
    expect(result.score).toBe(80);
    expect(result.tiers[KpiType.CycleTime]).toBe(HealthLevel.Elite);
    expect(result.tiers[KpiType.DefectEscape]).toBe(HealthLevel.Strong);
    expect(result.tiers[KpiType.ArchDrift]).toBe(HealthLevel.Strong);
    expect(result.tiers[KpiType.Mttrc]).toBe(HealthLevel.Strong);
    expect(result.tiers[KpiType.Rework]).toBe(HealthLevel.Strong);
  });

  it('should classify cycle_time=5 as Moderate with default thresholds', () => {
    const kpiValues: Record<KpiType, number> = {
      [KpiType.CycleTime]: 5,      // Moderate (>3, <=14)
      [KpiType.DefectEscape]: 15,   // Moderate (>10, <=20)
      [KpiType.ArchDrift]: 10,      // Moderate (>5, <=15)
      [KpiType.Mttrc]: 12,          // Moderate (>4, <=24)
      [KpiType.Rework]: 25,         // Moderate (>20, <=35)
    };

    const result = calculateHealthScore(kpiValues);

    expect(result.tiers[KpiType.CycleTime]).toBe(HealthLevel.Moderate);
    // All Moderate: 5 * 50 = 250 / 5 = 50
    expect(result.score).toBe(50);
    expect(result.tiers[KpiType.DefectEscape]).toBe(HealthLevel.Moderate);
    expect(result.tiers[KpiType.ArchDrift]).toBe(HealthLevel.Moderate);
    expect(result.tiers[KpiType.Mttrc]).toBe(HealthLevel.Moderate);
    expect(result.tiers[KpiType.Rework]).toBe(HealthLevel.Moderate);
  });

  it('should support custom thresholds that override defaults', () => {
    const customThresholds: ThresholdMap = {
      [KpiType.CycleTime]: { eliteMax: 2, strongMax: 5, moderateMax: 10 },
      [KpiType.DefectEscape]: { eliteMax: 3, strongMax: 8, moderateMax: 15 },
      [KpiType.ArchDrift]: { eliteMax: 1, strongMax: 3, moderateMax: 10 },
      [KpiType.Mttrc]: { eliteMax: 0.5, strongMax: 2, moderateMax: 12 },
      [KpiType.Rework]: { eliteMax: 5, strongMax: 15, moderateMax: 30 },
    };

    const kpiValues: Record<KpiType, number> = {
      [KpiType.CycleTime]: 1,       // Elite with custom (<=2)
      [KpiType.DefectEscape]: 1,     // Elite with custom (<=3)
      [KpiType.ArchDrift]: 0.5,      // Elite with custom (<=1)
      [KpiType.Mttrc]: 0.3,          // Elite with custom (<=0.5)
      [KpiType.Rework]: 3,           // Elite with custom (<=5)
    };

    const result = calculateHealthScore(kpiValues, customThresholds);

    // All Elite: 5 * 100 = 500 / 5 = 100
    expect(result.score).toBe(100);
    for (const kpi of Object.values(KpiType)) {
      expect(result.tiers[kpi]).toBe(HealthLevel.Elite);
    }
  });

  it('should classify Alert for values exceeding moderateMax', () => {
    const kpiValues: Record<KpiType, number> = {
      [KpiType.CycleTime]: 30,     // Alert (>14)
      [KpiType.DefectEscape]: 50,   // Alert (>20)
      [KpiType.ArchDrift]: 40,      // Alert (>15)
      [KpiType.Mttrc]: 48,          // Alert (>24)
      [KpiType.Rework]: 60,         // Alert (>35)
    };

    const result = calculateHealthScore(kpiValues);

    // All Alert: 5 * 25 = 125 / 5 = 25
    expect(result.score).toBe(25);
    for (const kpi of Object.values(KpiType)) {
      expect(result.tiers[kpi]).toBe(HealthLevel.Alert);
    }
  });

  it('should handle mixed tiers correctly', () => {
    const kpiValues: Record<KpiType, number> = {
      [KpiType.CycleTime]: 0.5,     // Elite (100)
      [KpiType.DefectEscape]: 8,     // Strong (75)
      [KpiType.ArchDrift]: 10,       // Moderate (50)
      [KpiType.Mttrc]: 30,           // Alert (25)
      [KpiType.Rework]: 15,          // Strong (75)
    };

    const result = calculateHealthScore(kpiValues);

    // (100 + 75 + 50 + 25 + 75) / 5 = 325 / 5 = 65
    expect(result.score).toBe(65);
    expect(result.tiers[KpiType.CycleTime]).toBe(HealthLevel.Elite);
    expect(result.tiers[KpiType.DefectEscape]).toBe(HealthLevel.Strong);
    expect(result.tiers[KpiType.ArchDrift]).toBe(HealthLevel.Moderate);
    expect(result.tiers[KpiType.Mttrc]).toBe(HealthLevel.Alert);
    expect(result.tiers[KpiType.Rework]).toBe(HealthLevel.Strong);
  });
});

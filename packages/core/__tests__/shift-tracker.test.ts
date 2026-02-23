import { describe, it, expect } from 'vitest';
import { calculateShift, calculateShiftWithVelocity } from '../src/engine/shift-tracker';
import { KpiType, ShiftDirection, ShiftVelocity } from '../src/types/kpi';

describe('calculateShift', () => {
  it('should report improving when cycle time decreases (5 -> 3, lower is better)', () => {
    const result = calculateShift(KpiType.CycleTime, 3, 5);

    // shiftPercent = (3 - 5) / 5 * 100 = -40%
    expect(result.shiftPercent).toBe(-40);
    expect(result.direction).toBe(ShiftDirection.Improving);
    expect(result.kpiType).toBe(KpiType.CycleTime);
  });

  it('should report flat when defect escape barely changes (10 -> 10.1, below 2% threshold)', () => {
    const result = calculateShift(KpiType.DefectEscape, 10.1, 10);

    // shiftPercent = (10.1 - 10) / 10 * 100 = 1%
    expect(result.shiftPercent).toBeCloseTo(1, 1);
    expect(result.direction).toBe(ShiftDirection.Flat);
  });

  it('should report declining when defect escape increases significantly', () => {
    const result = calculateShift(KpiType.DefectEscape, 15, 10);

    // shiftPercent = (15 - 10) / 10 * 100 = 50% (increasing is bad for lower-is-better)
    expect(result.shiftPercent).toBe(50);
    expect(result.direction).toBe(ShiftDirection.Declining);
  });

  it('should return 0 shift percent when previous is 0', () => {
    const result = calculateShift(KpiType.ArchDrift, 5, 0);

    expect(result.shiftPercent).toBe(0);
    expect(result.direction).toBe(ShiftDirection.Flat);
  });
});

describe('calculateShiftWithVelocity', () => {
  it('should detect accelerating velocity from increasing absolute shift magnitudes', () => {
    // Values that produce increasingly large absolute shifts
    // 10 -> 10 -> 10 -> 15 -> 25 (shifts: 0%, 0%, 50%, 66.7%)
    // Absolute shifts: [0, 0, 50, 66.7]
    // Moving average (window 3): [0+0+50]/3=16.7, [0+50+66.7]/3=38.9
    // 38.9 > 16.7 * 1.1 = 18.4 => accelerating
    const result = calculateShiftWithVelocity(KpiType.CycleTime, [10, 10, 10, 15, 25]);

    expect(result.velocity).toBe(ShiftVelocity.Accelerating);
    expect(result.kpiType).toBe(KpiType.CycleTime);
  });

  it('should return flat direction and stable velocity for fewer than 2 data points', () => {
    const result = calculateShiftWithVelocity(KpiType.Rework, [10]);

    expect(result.direction).toBe(ShiftDirection.Flat);
    expect(result.shiftPercent).toBe(0);
    expect(result.velocity).toBe(ShiftVelocity.Stable);
  });

  it('should compute direction correctly with 2 data points', () => {
    // CycleTime: lower is better, 5 -> 3 means improving
    const result = calculateShiftWithVelocity(KpiType.CycleTime, [5, 3]);

    expect(result.shiftPercent).toBe(-40);
    expect(result.direction).toBe(ShiftDirection.Improving);
    // Only 2 points, not enough for velocity calculation beyond stable
    expect(result.velocity).toBe(ShiftVelocity.Stable);
  });

  it('should detect decelerating velocity when absolute shifts decrease', () => {
    // Values producing decreasing absolute shifts:
    // 10 -> 20 -> 28 -> 30 (shifts: 100%, 40%, ~7.1%)
    // Absolute shifts: [100, 40, 7.1]
    // Moving average (window 3): only 1 value => not enough for comparison
    // Need more data points
    // 10 -> 20 -> 28 -> 30 -> 30.5
    // shifts: 100%, 40%, 7.14%, 1.67%
    // absolute: [100, 40, 7.14, 1.67]
    // MA(3): [100+40+7.14]/3=49.05, [40+7.14+1.67]/3=16.27
    // 16.27 < 49.05 * 0.9 = 44.14 => decelerating
    const result = calculateShiftWithVelocity(KpiType.DefectEscape, [10, 20, 28, 30, 30.5]);

    expect(result.velocity).toBe(ShiftVelocity.Decelerating);
  });

  it('should handle stable velocity when shifts are consistent', () => {
    // Consistent 10% increases: 100 -> 110 -> 121 -> 133.1
    // shifts: 10%, 10%, 10%
    // absolute: [10, 10, 10]
    // MA(3): [10] -> only 1 value, not enough for velocity comparison => stable
    const result = calculateShiftWithVelocity(KpiType.Rework, [100, 110, 121, 133.1]);

    expect(result.velocity).toBe(ShiftVelocity.Stable);
  });
});

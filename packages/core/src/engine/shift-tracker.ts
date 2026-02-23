import { KpiType, ShiftDirection, ShiftResult, ShiftVelocity } from '../types/kpi.js';
import { movingAverage } from '../utils/statistics.js';

const FLAT_THRESHOLD = 2;

const LOWER_IS_BETTER: Set<KpiType> = new Set([
  KpiType.CycleTime,
  KpiType.DefectEscape,
  KpiType.ArchDrift,
  KpiType.Mttrc,
  KpiType.Rework,
]);

export function calculateShift(
  kpiType: KpiType,
  current: number,
  previous: number,
): Omit<ShiftResult, 'velocity'> {
  const shiftPercent = previous === 0 ? 0 : ((current - previous) / previous) * 100;

  let direction: ShiftDirection;
  if (Math.abs(shiftPercent) < FLAT_THRESHOLD) {
    direction = ShiftDirection.Flat;
  } else {
    const isDecreasing = shiftPercent < 0;
    const lowerIsBetter = LOWER_IS_BETTER.has(kpiType);
    direction = isDecreasing === lowerIsBetter ? ShiftDirection.Improving : ShiftDirection.Declining;
  }

  return { kpiType, shiftPercent, direction };
}

export function calculateShiftWithVelocity(
  kpiType: KpiType,
  periodValues: number[],
): ShiftResult {
  if (periodValues.length < 2) {
    return {
      kpiType,
      shiftPercent: 0,
      direction: ShiftDirection.Flat,
      velocity: ShiftVelocity.Stable,
    };
  }

  const current = periodValues[periodValues.length - 1];
  const previous = periodValues[periodValues.length - 2];
  const { shiftPercent, direction } = calculateShift(kpiType, current, previous);

  let velocity = ShiftVelocity.Stable;

  if (periodValues.length >= 3) {
    const shifts: number[] = [];
    for (let i = 1; i < periodValues.length; i++) {
      const prev = periodValues[i - 1];
      if (prev !== 0) {
        shifts.push(((periodValues[i] - prev) / prev) * 100);
      }
    }

    if (shifts.length >= 2) {
      const ma = movingAverage(shifts.map(Math.abs), Math.min(3, shifts.length));
      if (ma.length >= 2) {
        const latestMa = ma[ma.length - 1];
        const previousMa = ma[ma.length - 2];
        if (latestMa > previousMa * 1.1) {
          velocity = ShiftVelocity.Accelerating;
        } else if (latestMa < previousMa * 0.9) {
          velocity = ShiftVelocity.Decelerating;
        }
      }
    }
  }

  return { kpiType, shiftPercent, direction, velocity };
}

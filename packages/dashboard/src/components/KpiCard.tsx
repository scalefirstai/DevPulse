import HealthBadge from './HealthBadge';
import ShiftIndicator from './ShiftIndicator';
import { formatKpiValue, kpiLabel } from '../utils/formatters';

interface KpiCardProps {
  kpiType: string;
  value: number;
  unit: string;
  healthLevel: string;
  shift?: { direction: string; velocity: string; shiftPercent: number };
}

export default function KpiCard({ kpiType, value, unit, healthLevel, shift }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-400">{kpiLabel(kpiType)}</span>
        <HealthBadge level={healthLevel} />
      </div>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold text-white">{formatKpiValue(value, unit)}</span>
        {shift && (
          <ShiftIndicator
            direction={shift.direction}
            shiftPercent={shift.shiftPercent}
            velocity={shift.velocity}
          />
        )}
      </div>
    </div>
  );
}

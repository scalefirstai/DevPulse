import { formatPercent } from '../utils/formatters';

interface ShiftIndicatorProps {
  direction: string;
  shiftPercent: number;
  velocity?: string;
}

export default function ShiftIndicator({ direction, shiftPercent, velocity }: ShiftIndicatorProps) {
  const isImproving = direction === 'improving';
  const isDecline = direction === 'declining';

  const color = isImproving ? 'text-emerald-400' : isDecline ? 'text-red-400' : 'text-gray-400';
  const arrow = isImproving ? '\u2191' : isDecline ? '\u2193' : '\u2192';

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${color}`}>
      <span className="text-base">{arrow}</span>
      <span>{formatPercent(Math.abs(shiftPercent))}</span>
      {velocity && velocity !== 'stable' && (
        <span className="text-xs text-gray-500">({velocity})</span>
      )}
    </span>
  );
}

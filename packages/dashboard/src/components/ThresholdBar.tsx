import { TIER_COLORS } from '../utils/colors';

interface ThresholdBarProps {
  value: number;
  eliteMax: number;
  strongMax: number;
  moderateMax: number;
  maxValue?: number;
}

export default function ThresholdBar({
  value,
  eliteMax,
  strongMax,
  moderateMax,
  maxValue,
}: ThresholdBarProps) {
  const max = maxValue || moderateMax * 1.5;
  const clampedValue = Math.min(value, max);
  const pct = (clampedValue / max) * 100;

  const elitePct = (eliteMax / max) * 100;
  const strongPct = (strongMax / max) * 100;
  const moderatePct = (moderateMax / max) * 100;

  return (
    <div className="relative h-3 w-full rounded-full bg-gray-800 overflow-hidden">
      {/* Tier background bands */}
      <div
        className="absolute inset-y-0 left-0 opacity-20"
        style={{ width: `${elitePct}%`, backgroundColor: TIER_COLORS.elite.hex }}
      />
      <div
        className="absolute inset-y-0 opacity-20"
        style={{ left: `${elitePct}%`, width: `${strongPct - elitePct}%`, backgroundColor: TIER_COLORS.strong.hex }}
      />
      <div
        className="absolute inset-y-0 opacity-20"
        style={{ left: `${strongPct}%`, width: `${moderatePct - strongPct}%`, backgroundColor: TIER_COLORS.moderate.hex }}
      />
      <div
        className="absolute inset-y-0 opacity-20"
        style={{ left: `${moderatePct}%`, right: 0, backgroundColor: TIER_COLORS.alert.hex }}
      />

      {/* Value indicator */}
      <div
        className="absolute top-0 h-full w-1 bg-white rounded-full shadow-sm"
        style={{ left: `${pct}%`, transform: 'translateX(-50%)' }}
      />
    </div>
  );
}

import { TIER_COLORS } from '../utils/colors';

interface HealthBadgeProps {
  level: string;
}

export default function HealthBadge({ level }: HealthBadgeProps) {
  const colors = TIER_COLORS[level as keyof typeof TIER_COLORS] || TIER_COLORS.moderate;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors.bg} ${colors.text}`}
    >
      {level}
    </span>
  );
}

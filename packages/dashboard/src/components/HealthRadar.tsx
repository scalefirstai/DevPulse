import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { TIER_COLORS } from '../utils/colors';
import { kpiLabel } from '../utils/formatters';
import type { KpiData } from '../api/kpis';

interface HealthRadarProps {
  kpis: KpiData[];
}

const LEVEL_SCORES: Record<string, number> = {
  elite: 100,
  strong: 75,
  moderate: 50,
  alert: 25,
};

export default function HealthRadar({ kpis }: HealthRadarProps) {
  const data = kpis.map((kpi) => ({
    kpi: kpiLabel(kpi.kpiType),
    score: LEVEL_SCORES[kpi.healthLevel] || 50,
    fullMark: 100,
  }));

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Health Radar</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="kpi" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickCount={5}
          />
          <Radar
            name="Health"
            dataKey="score"
            stroke={TIER_COLORS.strong.hex}
            fill={TIER_COLORS.strong.hex}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

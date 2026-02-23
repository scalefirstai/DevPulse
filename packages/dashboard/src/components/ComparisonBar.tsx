import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TIER_COLORS, CHART_THEME } from '../utils/colors';
import { formatKpiValue } from '../utils/formatters';

interface ComparisonEntry {
  teamName: string;
  value: number;
  healthLevel: string;
}

interface ComparisonBarProps {
  data: ComparisonEntry[];
  unit: string;
}

export default function ComparisonBar({ data, unit }: ComparisonBarProps) {
  const sorted = [...data].sort((a, b) => a.value - b.value);

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Team Comparison</h3>
      <ResponsiveContainer width="100%" height={Math.max(200, sorted.length * 60)}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 80 }}>
          <CartesianGrid stroke={CHART_THEME.gridColor} strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} stroke={CHART_THEME.axisColor} />
          <YAxis type="category" dataKey="teamName" tick={{ fill: '#e5e7eb', fontSize: 13 }} stroke={CHART_THEME.axisColor} width={80} />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: CHART_THEME.tooltipBg,
              border: `1px solid ${CHART_THEME.tooltipBorder}`,
              borderRadius: '8px',
              color: '#e5e7eb',
            }}
            formatter={(value: number) => [formatKpiValue(value, unit), 'Value']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {sorted.map((entry, i) => (
              <Cell key={i} fill={TIER_COLORS[entry.healthLevel as keyof typeof TIER_COLORS]?.hex || '#6b7280'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

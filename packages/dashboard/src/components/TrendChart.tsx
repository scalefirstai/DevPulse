import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { KPI_COLORS, CHART_THEME } from '../utils/colors';
import { formatDate, formatKpiValue } from '../utils/formatters';
import type { TrendPoint } from '../api/trends';

interface TrendChartProps {
  data: TrendPoint[];
  kpiType: string;
  unit?: string;
}

export default function TrendChart({ data, kpiType, unit = 'days' }: TrendChartProps) {
  const color = KPI_COLORS[kpiType] || '#6366f1';

  const chartData = data.map((d) => ({
    date: formatDate(d.periodEnd),
    value: d.value,
    healthLevel: d.healthLevel,
  }));

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid stroke={CHART_THEME.gridColor} strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} stroke={CHART_THEME.axisColor} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} stroke={CHART_THEME.axisColor} />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: CHART_THEME.tooltipBg,
              border: `1px solid ${CHART_THEME.tooltipBorder}`,
              borderRadius: '8px',
              color: '#e5e7eb',
            }}
            formatter={(value: number) => [formatKpiValue(value, unit), 'Value']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.1}
            strokeWidth={2}
            dot={{ fill: color, r: 3 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

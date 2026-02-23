import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from 'recharts';
import { CHART_THEME } from '../utils/colors';

interface ReworkPieProps {
  data: Record<string, number>;
}

const REASON_COLORS: Record<string, string> = {
  bug_fix: '#f43f5e',
  requirement_change: '#f97316',
  refactor: '#8b5cf6',
  scope_creep: '#06b6d4',
};

const REASON_LABELS: Record<string, string> = {
  bug_fix: 'Bug Fix',
  requirement_change: 'Req. Change',
  refactor: 'Refactor',
  scope_creep: 'Scope Creep',
};

export default function ReworkPie({ data }: ReworkPieProps) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([reason, count]) => ({
      name: REASON_LABELS[reason] || reason,
      value: count,
      color: REASON_COLORS[reason] || '#6b7280',
    }));

  if (chartData.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Rework by Cause</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip
            contentStyle={{
              backgroundColor: CHART_THEME.tooltipBg,
              border: `1px solid ${CHART_THEME.tooltipBorder}`,
              borderRadius: '8px',
              color: '#e5e7eb',
            }}
          />
          <Legend wrapperStyle={{ color: '#9ca3af' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

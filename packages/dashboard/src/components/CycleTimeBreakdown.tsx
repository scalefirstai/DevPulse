import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CHART_THEME } from '../utils/colors';

interface BreakdownData {
  period: string;
  ideation: number;
  coding: number;
  review: number;
  deploy: number;
}

interface CycleTimeBreakdownProps {
  data: BreakdownData[];
}

const PHASE_COLORS = {
  ideation: '#8b5cf6',
  coding: '#6366f1',
  review: '#06b6d4',
  deploy: '#10b981',
};

export default function CycleTimeBreakdown({ data }: CycleTimeBreakdownProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Cycle Time Breakdown</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid stroke={CHART_THEME.gridColor} strokeDasharray="3 3" />
          <XAxis dataKey="period" tick={{ fill: '#9ca3af', fontSize: 12 }} stroke={CHART_THEME.axisColor} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} stroke={CHART_THEME.axisColor} />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: CHART_THEME.tooltipBg,
              border: `1px solid ${CHART_THEME.tooltipBorder}`,
              borderRadius: '8px',
              color: '#e5e7eb',
            }}
          />
          <Legend wrapperStyle={{ color: '#9ca3af' }} />
          <Bar dataKey="ideation" stackId="a" fill={PHASE_COLORS.ideation} />
          <Bar dataKey="coding" stackId="a" fill={PHASE_COLORS.coding} />
          <Bar dataKey="review" stackId="a" fill={PHASE_COLORS.review} />
          <Bar dataKey="deploy" stackId="a" fill={PHASE_COLORS.deploy} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

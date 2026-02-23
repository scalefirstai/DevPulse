export const TIER_COLORS = {
  elite: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500', hex: '#34d399' },
  strong: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500', hex: '#60a5fa' },
  moderate: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500', hex: '#fbbf24' },
  alert: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500', hex: '#f87171' },
} as const;

export const KPI_COLORS: Record<string, string> = {
  cycle_time: '#6366f1',
  defect_escape: '#f43f5e',
  arch_drift: '#8b5cf6',
  mttrc: '#f97316',
  rework: '#06b6d4',
};

export const SEVERITY_COLORS = {
  info: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500' },
} as const;

export const CHART_THEME = {
  axisColor: '#4b5563',
  gridColor: '#1f2937',
  tooltipBg: '#111827',
  tooltipBorder: '#374151',
};

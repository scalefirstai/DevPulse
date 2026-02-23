import { SEVERITY_COLORS } from '../utils/colors';
import { kpiLabel } from '../utils/formatters';
import type { Insight } from '../api/insights';

interface InsightCardProps {
  insight: Insight;
  onDismiss: (id: string) => void;
}

export default function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const colors = SEVERITY_COLORS[insight.severity as keyof typeof SEVERITY_COLORS] || SEVERITY_COLORS.info;

  return (
    <div className={`rounded-xl border bg-gray-900 p-4 ${colors.border} border-opacity-30`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors.bg} ${colors.text}`}>
              {insight.severity}
            </span>
            {insight.kpisInvolved.map((kpi) => (
              <span key={kpi} className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                {kpiLabel(kpi)}
              </span>
            ))}
          </div>
          <h4 className="text-sm font-medium text-gray-200">{insight.title}</h4>
          <p className="mt-1 text-xs text-gray-400 line-clamp-2">{insight.description}</p>
        </div>
        <button
          onClick={() => onDismiss(insight.id)}
          className="shrink-0 rounded-lg p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
          title="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

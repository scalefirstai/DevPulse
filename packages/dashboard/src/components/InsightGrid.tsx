import InsightCard from './InsightCard';
import EmptyState from './EmptyState';
import type { Insight } from '../api/insights';

interface InsightGridProps {
  insights: Insight[];
  onDismiss: (id: string) => void;
}

export default function InsightGrid({ insights, onDismiss }: InsightGridProps) {
  if (insights.length === 0) {
    return <EmptyState title="No insights" description="All caught up! No actionable insights at this time." />;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-400">Insights</h3>
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

import { useState, useEffect } from 'react';
import KpiGrid from '../components/KpiGrid';
import HealthRadar from '../components/HealthRadar';
import InsightGrid from '../components/InsightGrid';
import EmptyState from '../components/EmptyState';
import { useKpiData } from '../hooks/useKpiData';
import { useHealthScore } from '../hooks/useHealthScore';
import { fetchTeams, type Team } from '../api/teams';
import { fetchInsights, dismissInsight, type Insight } from '../api/insights';

export default function Overview() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const { data: kpis, loading, error } = useKpiData(selectedTeam);
  const { data: health } = useHealthScore();

  useEffect(() => {
    fetchTeams().then((t) => {
      setTeams(t);
      if (t.length > 0 && !selectedTeam) setSelectedTeam(t[0].slug);
    }).catch(() => {});
    fetchInsights().then(setInsights).catch(() => {});
  }, []);

  const handleDismiss = async (id: string) => {
    await dismissInsight(id);
    setInsights((prev) => prev.filter((i) => i.id !== id));
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  if (error) {
    return <EmptyState title="Failed to load data" description={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          {health && (
            <p className="text-sm text-gray-400 mt-1">
              Org Health Score: <span className="text-white font-medium">{health.score}</span>/100
            </p>
          )}
        </div>
        <select
          value={selectedTeam || ''}
          onChange={(e) => setSelectedTeam(e.target.value)}
          className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200"
        >
          {teams.map((team) => (
            <option key={team.slug} value={team.slug}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <KpiGrid kpis={kpis} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HealthRadar kpis={kpis} />
        <InsightGrid insights={insights} onDismiss={handleDismiss} />
      </div>
    </div>
  );
}

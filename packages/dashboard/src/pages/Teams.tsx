import { useState, useEffect } from 'react';
import ComparisonBar from '../components/ComparisonBar';
import TeamTable from '../components/TeamTable';
import EmptyState from '../components/EmptyState';
import { fetchTeams, type Team } from '../api/teams';
import client from '../api/client';
import { kpiLabel } from '../utils/formatters';

const KPI_TYPES = ['cycle_time', 'defect_escape', 'arch_drift', 'mttrc', 'rework'];
const KPI_UNITS: Record<string, string> = {
  cycle_time: 'days',
  defect_escape: 'percent',
  arch_drift: 'percent',
  mttrc: 'hours',
  rework: 'percent',
};

interface ComparisonData {
  teamName: string;
  teamSlug: string;
  kpis: { kpiType: string; value: number; unit: string; healthLevel: string }[];
}

export default function Teams() {
  const [selectedKpi, setSelectedKpi] = useState('cycle_time');
  const [teams, setTeams] = useState<Team[]>([]);
  const [comparison, setComparison] = useState<ComparisonData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const teamsData = await fetchTeams();
        setTeams(teamsData);

        if (teamsData.length > 0) {
          const slugs = teamsData.map((t) => t.slug).join(',');
          const { data } = await client.get(`/compare?teams=${slugs}&kpi=all`);
          setComparison(data);
        }
      } catch {
        // handle silently
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="text-gray-400">Loading...</div>;
  if (teams.length === 0) return <EmptyState title="No teams" description="Create a team to get started." />;

  const barData = comparison.map((t) => {
    const kpi = t.kpis.find((k) => k.kpiType === selectedKpi);
    return {
      teamName: t.teamName,
      value: kpi?.value || 0,
      healthLevel: kpi?.healthLevel || 'moderate',
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Teams</h1>
        <select
          value={selectedKpi}
          onChange={(e) => setSelectedKpi(e.target.value)}
          className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200"
        >
          {KPI_TYPES.map((kpi) => (
            <option key={kpi} value={kpi}>{kpiLabel(kpi)}</option>
          ))}
        </select>
      </div>

      <ComparisonBar data={barData} unit={KPI_UNITS[selectedKpi]} />

      <TeamTable
        teams={comparison.map((t) => ({
          name: t.teamName,
          slug: t.teamSlug,
          kpis: t.kpis,
        }))}
      />
    </div>
  );
}

import HealthBadge from './HealthBadge';
import { formatKpiValue, kpiLabel } from '../utils/formatters';

interface TeamKpi {
  kpiType: string;
  value: number;
  unit: string;
  healthLevel: string;
}

interface TeamRow {
  name: string;
  slug: string;
  kpis: TeamKpi[];
}

interface TeamTableProps {
  teams: TeamRow[];
}

const KPI_ORDER = ['cycle_time', 'defect_escape', 'arch_drift', 'mttrc', 'rework'];

export default function TeamTable({ teams }: TeamTableProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Team</th>
              {KPI_ORDER.map((kpi) => (
                <th key={kpi} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                  {kpiLabel(kpi)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {teams.map((team) => (
              <tr key={team.slug} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-200">{team.name}</td>
                {KPI_ORDER.map((kpiType) => {
                  const kpi = team.kpis.find((k) => k.kpiType === kpiType);
                  return (
                    <td key={kpiType} className="px-4 py-3">
                      {kpi ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-200">{formatKpiValue(kpi.value, kpi.unit)}</span>
                          <HealthBadge level={kpi.healthLevel} />
                        </div>
                      ) : (
                        <span className="text-gray-600">--</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import TrendChart from '../components/TrendChart';
import { fetchTrends, type TrendPoint } from '../api/trends';
import { kpiLabel } from '../utils/formatters';

const KPI_TYPES = ['cycle_time', 'defect_escape', 'arch_drift', 'mttrc', 'rework'];
const RANGES = ['30d', '60d', '90d'];
const KPI_UNITS: Record<string, string> = {
  cycle_time: 'days',
  defect_escape: 'percent',
  arch_drift: 'percent',
  mttrc: 'hours',
  rework: 'percent',
};

export default function Trends() {
  const [selectedKpi, setSelectedKpi] = useState('cycle_time');
  const [range, setRange] = useState('90d');
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchTrends(selectedKpi, range)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [selectedKpi, range]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Trends</h1>
        <div className="flex items-center gap-3">
          <select
            value={selectedKpi}
            onChange={(e) => setSelectedKpi(e.target.value)}
            className="rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-gray-200"
          >
            {KPI_TYPES.map((kpi) => (
              <option key={kpi} value={kpi}>{kpiLabel(kpi)}</option>
            ))}
          </select>
          <div className="flex rounded-lg border border-gray-700 overflow-hidden">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-2 text-sm ${
                  range === r ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <TrendChart data={data} kpiType={selectedKpi} unit={KPI_UNITS[selectedKpi]} />
      )}
    </div>
  );
}

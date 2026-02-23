import KpiCard from './KpiCard';
import type { KpiData } from '../api/kpis';

interface KpiGridProps {
  kpis: KpiData[];
}

export default function KpiGrid({ kpis }: KpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {kpis.map((kpi) => (
        <KpiCard
          key={kpi.kpiType}
          kpiType={kpi.kpiType}
          value={kpi.value}
          unit={kpi.unit}
          healthLevel={kpi.healthLevel}
          shift={kpi.shift}
        />
      ))}
    </div>
  );
}

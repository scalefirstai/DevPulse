import { useState, useEffect, useCallback } from 'react';
import { fetchKpis, type KpiData } from '../api/kpis';

export function useKpiData(teamSlug: string | null) {
  const [data, setData] = useState<KpiData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!teamSlug) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetchKpis(teamSlug);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load KPI data');
    } finally {
      setLoading(false);
    }
  }, [teamSlug]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

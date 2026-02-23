import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

interface HealthScore {
  score: number;
  teamCount: number;
}

export function useHealthScore() {
  const [data, setData] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result } = await client.get<HealthScore>('/health');
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load health score');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

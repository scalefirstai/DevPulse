import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

interface ShiftData {
  kpiType: string;
  shiftPercent: number;
  direction: 'improving' | 'declining' | 'flat';
  velocity: 'accelerating' | 'decelerating' | 'stable';
}

export function useShiftTracking(teamSlug: string | null) {
  const [data, setData] = useState<ShiftData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!teamSlug) return;
    setLoading(true);
    setError(null);
    try {
      const { data: result } = await client.get<ShiftData[]>(`/shifts/${teamSlug}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shift data');
    } finally {
      setLoading(false);
    }
  }, [teamSlug]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

import client from './client';

export interface TrendPoint {
  periodEnd: string;
  value: number;
  healthLevel: string;
}

export async function fetchTrends(kpiType: string, range = '90d'): Promise<TrendPoint[]> {
  const { data } = await client.get<TrendPoint[]>(`/trends/${kpiType}`, {
    params: { range },
  });
  return data;
}

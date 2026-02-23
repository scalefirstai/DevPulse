import client from './client';

export interface KpiData {
  kpiType: string;
  value: number;
  unit: string;
  healthLevel: string;
  shift?: { direction: string; velocity: string; shiftPercent: number };
  breakdown?: Record<string, unknown>;
}

export interface KpiDetail extends KpiData {
  periodStart: string;
  periodEnd: string;
}

export async function fetchKpis(teamSlug: string): Promise<KpiData[]> {
  const { data } = await client.get<KpiData[]>(`/kpis/${teamSlug}`);
  return data;
}

export async function fetchKpiDetail(teamSlug: string, kpiType: string): Promise<KpiDetail> {
  const { data } = await client.get<KpiDetail>(`/kpis/${teamSlug}/${kpiType}`);
  return data;
}

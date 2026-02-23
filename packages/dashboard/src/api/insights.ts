import client from './client';

export interface Insight {
  id: string;
  teamId: string | null;
  insightType: string;
  severity: string;
  title: string;
  description: string;
  kpisInvolved: string[];
  data: Record<string, unknown>;
  dismissedAt: string | null;
  createdAt: string;
}

export async function fetchInsights(severity?: string): Promise<Insight[]> {
  const { data } = await client.get<Insight[]>('/insights', {
    params: severity ? { severity } : undefined,
  });
  return data;
}

export async function dismissInsight(id: string): Promise<void> {
  await client.post(`/insights/${id}/dismiss`);
}

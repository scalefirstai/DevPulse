import client from './client';

export interface Team {
  id: string;
  name: string;
  slug: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export async function fetchTeams(): Promise<Team[]> {
  const { data } = await client.get<Team[]>('/teams');
  return data;
}

export async function createTeam(team: { name: string; slug: string; metadata?: Record<string, unknown> }): Promise<Team> {
  const { data } = await client.post<Team>('/teams', team);
  return data;
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team> {
  const { data } = await client.put<Team>(`/teams/${id}`, updates);
  return data;
}

export async function deleteTeam(id: string): Promise<void> {
  await client.delete(`/teams/${id}`);
}

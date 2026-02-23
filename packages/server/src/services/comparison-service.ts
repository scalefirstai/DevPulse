import { query } from '../config/database.js';

interface ComparisonRow {
  team_slug: string;
  team_name: string;
  kpi_type: string;
  value: string;
  health_level: string;
  [key: string]: unknown;
}

export async function compareTeams(teamSlugs: string[], kpiType?: string) {
  const kpiFilter = kpiType && kpiType !== 'all' ? 'AND ks.kpi_type = $2' : '';
  const params: unknown[] = [teamSlugs];
  if (kpiType && kpiType !== 'all') {
    params.push(kpiType);
  }

  const result = await query<ComparisonRow>(
    `SELECT DISTINCT ON (t.slug, ks.kpi_type)
       t.slug AS team_slug, t.name AS team_name,
       ks.kpi_type, ks.value, ks.health_level
     FROM kpi_snapshots ks
     JOIN teams t ON ks.team_id = t.id
     WHERE t.slug = ANY($1) ${kpiFilter}
     ORDER BY t.slug, ks.kpi_type, ks.period_end DESC`,
    params,
  );

  const grouped: Record<string, Record<string, { value: number; healthLevel: string }>> = {};
  for (const row of result.rows) {
    if (!grouped[row.team_slug]) {
      grouped[row.team_slug] = {};
    }
    grouped[row.team_slug][row.kpi_type] = {
      value: parseFloat(row.value),
      healthLevel: row.health_level,
    };
  }

  return Object.entries(grouped).map(([slug, kpis]) => ({
    teamSlug: slug,
    kpis,
  }));
}

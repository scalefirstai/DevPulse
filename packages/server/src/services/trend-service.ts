import { query } from '../config/database.js';

interface TrendRow {
  value: string;
  period_end: Date;
  breakdown: Record<string, unknown>;
  health_level: string;
  [key: string]: unknown;
}

export async function getTrends(kpiType: string, rangeDays: number, teamSlug?: string) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - rangeDays);

  let sql: string;
  let params: unknown[];

  if (teamSlug) {
    sql = `
      SELECT ks.value, ks.period_end, ks.breakdown, ks.health_level
      FROM kpi_snapshots ks
      JOIN teams t ON ks.team_id = t.id
      WHERE ks.kpi_type = $1 AND ks.period_end >= $2 AND t.slug = $3
      ORDER BY ks.period_end ASC
    `;
    params = [kpiType, startDate, teamSlug];
  } else {
    sql = `
      SELECT ks.value, ks.period_end, ks.breakdown, ks.health_level
      FROM kpi_snapshots ks
      WHERE ks.kpi_type = $1 AND ks.period_end >= $2
      ORDER BY ks.period_end ASC
    `;
    params = [kpiType, startDate];
  }

  const result = await query<TrendRow>(sql, params);

  return result.rows.map((row) => ({
    value: parseFloat(row.value),
    periodEnd: row.period_end,
    breakdown: row.breakdown,
    healthLevel: row.health_level,
  }));
}

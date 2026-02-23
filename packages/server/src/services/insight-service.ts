import { query } from '../config/database.js';

interface InsightRow {
  id: string;
  team_id: string;
  insight_type: string;
  title: string;
  description: string;
  severity: string;
  kpis_involved: string[];
  data: Record<string, unknown>;
  generated_at: Date;
  [key: string]: unknown;
}

export async function getInsights(severity?: string) {
  let sql = `
    SELECT id, team_id, insight_type, title, description, severity,
           kpis_involved, data, generated_at
    FROM insights
    WHERE dismissed_at IS NULL
  `;
  const params: unknown[] = [];

  if (severity) {
    sql += ' AND severity = $1';
    params.push(severity);
  }

  sql += ' ORDER BY generated_at DESC LIMIT 50';

  const result = await query<InsightRow>(sql, params);
  return result.rows.map((row) => ({
    id: row.id,
    teamId: row.team_id,
    insightType: row.insight_type,
    title: row.title,
    description: row.description,
    severity: row.severity,
    kpisInvolved: row.kpis_involved,
    data: row.data,
    generatedAt: row.generated_at,
  }));
}

export async function dismissInsight(insightId: string): Promise<boolean> {
  const result = await query(
    'UPDATE insights SET dismissed_at = NOW() WHERE id = $1 AND dismissed_at IS NULL',
    [insightId],
  );
  return (result.rowCount ?? 0) > 0;
}

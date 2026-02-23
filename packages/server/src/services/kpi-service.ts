import { query } from '../config/database.js';
import { KpiType } from '@devpulse/core';
import { classifyHealthLevel, getThresholdForKpi } from '@devpulse/core';

interface KpiRow {
  kpi_type: string;
  value: string;
  unit: string;
  period_start: Date;
  period_end: Date;
  breakdown: Record<string, unknown>;
  health_level: string;
  [key: string]: unknown;
}

interface ThresholdRow {
  kpi_type: string;
  elite_max: string;
  strong_max: string;
  moderate_max: string;
  [key: string]: unknown;
}

async function getThresholds(teamId: string) {
  const result = await query<ThresholdRow>(
    `SELECT kpi_type, elite_max, strong_max, moderate_max
     FROM thresholds
     WHERE team_id = $1 OR team_id IS NULL
     ORDER BY team_id NULLS LAST`,
    [teamId],
  );

  const map: Record<string, { eliteMax: number; strongMax: number; moderateMax: number }> = {};
  for (const row of result.rows) {
    if (!map[row.kpi_type]) {
      map[row.kpi_type] = {
        eliteMax: parseFloat(row.elite_max),
        strongMax: parseFloat(row.strong_max),
        moderateMax: parseFloat(row.moderate_max),
      };
    }
  }
  return map;
}

export async function getKpisForTeam(teamSlug: string) {
  const teamResult = await query<{ id: string }>('SELECT id FROM teams WHERE slug = $1', [
    teamSlug,
  ]);
  if (teamResult.rows.length === 0) return null;

  const teamId = teamResult.rows[0].id;
  const thresholds = await getThresholds(teamId);

  const kpiResult = await query<KpiRow>(
    `SELECT DISTINCT ON (kpi_type)
       kpi_type, value, unit, period_start, period_end, breakdown, health_level
     FROM kpi_snapshots
     WHERE team_id = $1
     ORDER BY kpi_type, period_end DESC`,
    [teamId],
  );

  return kpiResult.rows.map((row) => {
    const value = parseFloat(row.value);
    const threshold = thresholds[row.kpi_type] ??
      getThresholdForKpi(row.kpi_type as KpiType);
    const healthLevel = classifyHealthLevel(value, threshold);

    return {
      kpiType: row.kpi_type,
      value,
      unit: row.unit,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      breakdown: row.breakdown,
      healthLevel,
    };
  });
}

export async function getKpiDetail(teamSlug: string, kpiType: string) {
  const teamResult = await query<{ id: string }>('SELECT id FROM teams WHERE slug = $1', [
    teamSlug,
  ]);
  if (teamResult.rows.length === 0) return null;

  const teamId = teamResult.rows[0].id;

  const result = await query<KpiRow>(
    `SELECT kpi_type, value, unit, period_start, period_end, breakdown, health_level
     FROM kpi_snapshots
     WHERE team_id = $1 AND kpi_type = $2
     ORDER BY period_end DESC
     LIMIT 1`,
    [teamId, kpiType],
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    kpiType: row.kpi_type,
    value: parseFloat(row.value),
    unit: row.unit,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    breakdown: row.breakdown,
    healthLevel: row.health_level,
  };
}

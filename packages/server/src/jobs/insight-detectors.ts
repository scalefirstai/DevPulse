import { query } from '../config/database.js';
import { pearsonCorrelation, standardDeviation, mean } from '@devpulse/core';

interface TeamInfo {
  id: string;
  slug: string;
  name: string;
}

interface InsightInput {
  teamId: string | null;
  insightType: string;
  severity: string;
  title: string;
  description: string;
  kpisInvolved: string[];
  data: Record<string, unknown>;
}

const MIN_DATA_POINTS = 30;
const CORRELATION_THRESHOLD = 0.7;
const ANOMALY_SIGMA = 2;
const HOTSPOT_DELTA = 10; // percentage points

/**
 * Detect correlations between KPI pairs across 90 days of data.
 * Generates insight if |r| > 0.7 with minimum 30 data points.
 */
export async function detectCorrelations(
  kpiTypes: string[],
  teams: TeamInfo[],
): Promise<InsightInput[]> {
  const insights: InsightInput[] = [];

  for (let i = 0; i < kpiTypes.length; i++) {
    for (let j = i + 1; j < kpiTypes.length; j++) {
      const kpiA = kpiTypes[i];
      const kpiB = kpiTypes[j];

      const valuesA: number[] = [];
      const valuesB: number[] = [];

      for (const team of teams) {
        const resultA = await query<{ value: string }>(
          `SELECT value FROM kpi_snapshots
           WHERE team_id = $1 AND kpi_type = $2 AND period_end >= NOW() - INTERVAL '90 days'
           ORDER BY period_end`,
          [team.id, kpiA],
        );
        const resultB = await query<{ value: string }>(
          `SELECT value FROM kpi_snapshots
           WHERE team_id = $1 AND kpi_type = $2 AND period_end >= NOW() - INTERVAL '90 days'
           ORDER BY period_end`,
          [team.id, kpiB],
        );

        const minLen = Math.min(resultA.rows.length, resultB.rows.length);
        for (let k = 0; k < minLen; k++) {
          valuesA.push(parseFloat(resultA.rows[k].value));
          valuesB.push(parseFloat(resultB.rows[k].value));
        }
      }

      if (valuesA.length < MIN_DATA_POINTS) continue;

      const r = pearsonCorrelation(valuesA, valuesB);
      if (Math.abs(r) > CORRELATION_THRESHOLD) {
        const direction = r > 0 ? 'positive' : 'negative';
        insights.push({
          teamId: null,
          insightType: 'correlation',
          severity: 'info',
          title: `${formatKpi(kpiA)} correlates with ${formatKpi(kpiB)}`,
          description: `Across all teams, ${formatKpi(kpiA)} and ${formatKpi(kpiB)} show strong ${direction} correlation (r=${r.toFixed(2)}).`,
          kpisInvolved: [kpiA, kpiB],
          data: { r: parseFloat(r.toFixed(3)), dataPoints: valuesA.length, teams: teams.map((t) => t.slug) },
        });
      }
    }
  }

  return insights;
}

/**
 * Detect anomalies using rolling 30-day mean and stddev.
 * Generates critical insight if value > mean + 2σ.
 */
export async function detectAnomalies(
  team: TeamInfo,
  kpiType: string,
): Promise<InsightInput[]> {
  const result = await query<{ value: string; period_end: string }>(
    `SELECT value, period_end FROM kpi_snapshots
     WHERE team_id = $1 AND kpi_type = $2
     ORDER BY period_end DESC LIMIT 12`,
    [team.id, kpiType],
  );

  if (result.rows.length < 4) return [];

  const values = result.rows.map((r) => parseFloat(r.value)).reverse();
  const current = values[values.length - 1];
  const historical = values.slice(0, -1);

  const avg = mean(historical);
  const sd = standardDeviation(historical);

  if (sd === 0) return [];

  const sigma = (current - avg) / sd;

  if (sigma > ANOMALY_SIGMA) {
    return [
      {
        teamId: team.id,
        insightType: 'anomaly',
        severity: sigma > 3 ? 'critical' : 'warning',
        title: `${formatKpi(kpiType)} spike detected for ${team.name}`,
        description: `${team.name} ${formatKpi(kpiType)} jumped to ${current.toFixed(1)} (mean + ${sigma.toFixed(1)}σ above historical average of ${avg.toFixed(1)}).`,
        kpisInvolved: [kpiType],
        data: { currentValue: current, mean: parseFloat(avg.toFixed(2)), stdDev: parseFloat(sd.toFixed(2)), sigma: parseFloat(sigma.toFixed(1)) },
      },
    ];
  }

  return [];
}

/**
 * Detect hotspots: teams significantly worse than org average.
 * Generates warning if team > org + 10 percentage points.
 */
export async function detectHotspots(
  teams: TeamInfo[],
  kpiType: string,
): Promise<InsightInput[]> {
  const insights: InsightInput[] = [];
  const teamValues: { team: TeamInfo; value: number }[] = [];

  for (const team of teams) {
    const result = await query<{ value: string }>(
      `SELECT value FROM kpi_snapshots
       WHERE team_id = $1 AND kpi_type = $2
       ORDER BY period_end DESC LIMIT 1`,
      [team.id, kpiType],
    );
    if (result.rows.length > 0) {
      teamValues.push({ team, value: parseFloat(result.rows[0].value) });
    }
  }

  if (teamValues.length < 2) return insights;

  const orgAvg = mean(teamValues.map((tv) => tv.value));

  for (const { team, value } of teamValues) {
    const delta = value - orgAvg;
    if (delta > HOTSPOT_DELTA) {
      insights.push({
        teamId: team.id,
        insightType: 'hotspot',
        severity: 'warning',
        title: `${team.name} ${formatKpi(kpiType)} significantly above org average`,
        description: `${team.name} ${formatKpi(kpiType)} (${value.toFixed(1)}) is ${delta.toFixed(1)} percentage points above the org average (${orgAvg.toFixed(1)}).`,
        kpisInvolved: [kpiType],
        data: { teamValue: value, orgAverage: parseFloat(orgAvg.toFixed(1)), delta: parseFloat(delta.toFixed(1)) },
      });
    }
  }

  return insights;
}

function formatKpi(kpiType: string): string {
  const labels: Record<string, string> = {
    cycle_time: 'Cycle Time',
    defect_escape: 'Defect Escape Rate',
    arch_drift: 'Architecture Drift',
    mttrc: 'MTTRC',
    rework: 'Rework Rate',
  };
  return labels[kpiType] || kpiType;
}

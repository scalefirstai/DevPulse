import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { getQueue, QUEUE_NAMES } from '../config/queues.js';
import { query } from '../config/database.js';
import {
  calculateCycleTime,
  calculateDefectEscapeRate,
  calculateArchDrift,
  calculateMttrc,
  calculateRework,
  KpiType,
} from '@devpulse/core';

interface KpiJobData {
  teamId: string;
  teamSlug: string;
  triggeredAt: string;
}

export function startKpiCalculator(): Worker {
  const connection = getRedisConnection();

  const worker = new Worker<KpiJobData>(
    QUEUE_NAMES.KPI_CALCULATION,
    async (job: Job<KpiJobData>) => {
      const { teamId, teamSlug } = job.data;
      console.log(`[kpi-calculator] Calculating KPIs for team ${teamSlug}`);

      const periodEnd = new Date();
      const periodStart = new Date(periodEnd.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch raw data for all KPI calculations
      const [prRows, defectRows, incidentRows, violationRows] = await Promise.all([
        query<any>(
          `SELECT * FROM pr_events WHERE team_id = $1 AND created_at >= $2 AND created_at <= $3`,
          [teamId, periodStart, periodEnd],
        ),
        query<any>(
          `SELECT * FROM defects WHERE team_id = $1 AND created_at >= $2 AND created_at <= $3`,
          [teamId, periodStart, periodEnd],
        ),
        query<any>(
          `SELECT * FROM incidents WHERE team_id = $1 AND detected_at >= $2 AND detected_at <= $3`,
          [teamId, periodStart, periodEnd],
        ),
        query<any>(
          `SELECT * FROM arch_violations WHERE team_id = $1 AND first_detected_at <= $2`,
          [teamId, periodEnd],
        ),
      ]);

      const prs = prRows.rows;
      const defects = defectRows.rows;
      const incidents = incidentRows.rows;
      const violations = violationRows.rows;

      // Calculate each KPI
      const kpis = [
        { type: KpiType.CycleTime, result: calculateCycleTime({ prEvents: prs }) },
        { type: KpiType.DefectEscape, result: calculateDefectEscapeRate(defects) },
        { type: KpiType.ArchDrift, result: calculateArchDrift({ violations }) },
        { type: KpiType.Mttrc, result: calculateMttrc(incidents) },
        { type: KpiType.Rework, result: calculateRework({ prEvents: prs }) },
      ];

      // Upsert KPI snapshots
      for (const kpi of kpis) {
        const value = getKpiValue(kpi.type, kpi.result);
        const unit = getKpiUnit(kpi.type);
        await query(
          `INSERT INTO kpi_snapshots (team_id, kpi_type, value, unit, period_start, period_end, breakdown)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (team_id, kpi_type, period_end) DO UPDATE SET
             value = $3, breakdown = $7`,
          [teamId, kpi.type, value, unit, periodStart, periodEnd, JSON.stringify(kpi.result)],
        );
      }

      // Enqueue shift calculation
      const shiftQueue = getQueue(QUEUE_NAMES.SHIFT_CALCULATION);
      await shiftQueue.add(`shift-${teamSlug}`, { teamId, teamSlug });

      console.log(`[kpi-calculator] Completed KPIs for team ${teamSlug}`);
      return { teamSlug, kpisCalculated: kpis.length };
    },
    {
      connection: connection as any,
      concurrency: 3,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[kpi-calculator] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

function getKpiValue(type: KpiType, result: unknown): number {
  switch (type) {
    case KpiType.CycleTime:
      return (result as { median: number }).median;
    case KpiType.DefectEscape:
      return (result as { rate: number }).rate;
    case KpiType.ArchDrift:
      return (result as { driftPercent: number }).driftPercent;
    case KpiType.Mttrc:
      return (result as { median: number }).median;
    case KpiType.Rework:
      return (result as { reworkPercent: number }).reworkPercent;
  }
}

function getKpiUnit(type: KpiType): string {
  switch (type) {
    case KpiType.CycleTime:
      return 'days';
    case KpiType.DefectEscape:
      return 'percent';
    case KpiType.ArchDrift:
      return 'percent';
    case KpiType.Mttrc:
      return 'hours';
    case KpiType.Rework:
      return 'percent';
  }
}

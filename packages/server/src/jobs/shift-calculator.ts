import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { query } from '../config/database.js';
import { KpiType, calculateShiftWithVelocity } from '@devpulse/core';

interface ShiftJobData {
  teamId: string;
  teamSlug: string;
}

export function startShiftCalculator(): Worker {
  const connection = getRedisConnection();

  const worker = new Worker<ShiftJobData>(
    'shift-calculation',
    async (job: Job<ShiftJobData>) => {
      const { teamId, teamSlug } = job.data;
      console.log(`[shift-calculator] Computing shifts for team ${teamSlug}`);

      const kpiTypes = Object.values(KpiType);
      const results = [];

      for (const kpiType of kpiTypes) {
        const snapshots = await query<{ value: string }>(
          `SELECT value FROM kpi_snapshots
           WHERE team_id = $1 AND kpi_type = $2
           ORDER BY period_end DESC LIMIT 5`,
          [teamId, kpiType],
        );

        const values = snapshots.rows.map((r) => parseFloat(r.value)).reverse();
        if (values.length >= 2) {
          const shift = calculateShiftWithVelocity(kpiType, values);
          results.push(shift);
        }
      }

      console.log(`[shift-calculator] Computed ${results.length} shifts for team ${teamSlug}`);
      return { teamSlug, shiftsComputed: results.length };
    },
    {
      connection: connection as any,
      concurrency: 5,
    },
  );

  worker.on('failed', (job, err) => {
    console.error(`[shift-calculator] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

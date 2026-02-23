import { Worker, Job } from 'bullmq';
import { getRedisConnection } from '../config/redis.js';
import { getQueue, QUEUE_NAMES } from '../config/queues.js';
import { query } from '../config/database.js';

interface CollectionJobData {
  triggeredAt: string;
}

export function startCollectionScheduler(): Worker {
  const connection = getRedisConnection();

  const worker = new Worker<CollectionJobData>(
    QUEUE_NAMES.DATA_COLLECTION,
    async (job: Job<CollectionJobData>) => {
      console.log(`[collection-scheduler] Starting collection job ${job.id}`);

      const teams = await query<{ id: string; slug: string }>(
        'SELECT id, slug FROM teams ORDER BY name',
      );

      if (teams.rows.length === 0) {
        console.log('[collection-scheduler] No teams configured, skipping');
        return { teamsProcessed: 0 };
      }

      // Enqueue KPI calculation for each team after data is collected
      const kpiQueue = getQueue(QUEUE_NAMES.KPI_CALCULATION);
      for (const team of teams.rows) {
        await kpiQueue.add(`calculate-${team.slug}`, {
          teamId: team.id,
          teamSlug: team.slug,
          triggeredAt: job.data.triggeredAt,
        });
      }

      console.log(`[collection-scheduler] Enqueued KPI calculation for ${teams.rows.length} teams`);
      return { teamsProcessed: teams.rows.length };
    },
    {
      connection: connection as any,
      concurrency: 1,
    },
  );

  worker.on('completed', (job) => {
    console.log(`[collection-scheduler] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[collection-scheduler] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

export function schedulePeriodicCollection(cronExpression = '0 */6 * * *'): void {
  const queue = getQueue(QUEUE_NAMES.DATA_COLLECTION);
  queue.add(
    'scheduled-collection',
    { triggeredAt: new Date().toISOString() },
    {
      repeat: { pattern: cronExpression },
    },
  );
  console.log(`[collection-scheduler] Periodic collection scheduled: ${cronExpression}`);
}

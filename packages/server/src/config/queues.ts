import { Queue } from 'bullmq';
import { getRedisConnection } from './redis.js';

export const QUEUE_NAMES = {
  DATA_COLLECTION: 'data-collection',
  KPI_CALCULATION: 'kpi-calculation',
  INSIGHT_GENERATION: 'insight-generation',
  SHIFT_CALCULATION: 'shift-calculation',
} as const;

const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 1000,
  },
  removeOnComplete: 100,
  removeOnFail: 50,
};

let queues: Map<string, Queue> = new Map();

export function initQueues(): Map<string, Queue> {
  const connection = getRedisConnection();

  for (const name of Object.values(QUEUE_NAMES)) {
    const queue = new Queue(name, {
      connection: connection as any,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
    queues.set(name, queue);
  }

  return queues;
}

export function getQueue(name: string): Queue {
  const queue = queues.get(name);
  if (!queue) {
    throw new Error(`Queue ${name} not initialized.`);
  }
  return queue;
}

export async function closeQueues(): Promise<void> {
  for (const queue of queues.values()) {
    await queue.close();
  }
  queues = new Map();
}

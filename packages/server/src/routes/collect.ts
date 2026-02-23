import { Router } from 'express';
import { apiKeyAuth } from '../middleware/auth.js';
import { collectLimiter } from '../middleware/rate-limiter.js';
import { getQueue, QUEUE_NAMES } from '../config/queues.js';

const router: Router = Router();
const apiKeyHash = process.env.API_KEY_HASH || null;

router.post(
  '/api/collect/trigger',
  apiKeyAuth(apiKeyHash),
  collectLimiter,
  async (_req, res, next) => {
    try {
      const queue = getQueue(QUEUE_NAMES.DATA_COLLECTION);
      const job = await queue.add('collect-all', { triggeredAt: new Date().toISOString() });
      res.json({ jobId: job.id, status: 'queued' });
    } catch (error) {
      next(error);
    }
  },
);

router.get('/api/collect/status', apiKeyAuth(apiKeyHash), async (_req, res, next) => {
  try {
    const queue = getQueue(QUEUE_NAMES.DATA_COLLECTION);
    const [waiting, active, completed, failed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
    ]);
    res.json({ waiting, active, completed, failed });
  } catch (error) {
    next(error);
  }
});

export default router;

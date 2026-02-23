import { Router } from 'express';
import { getTrends } from '../services/trend-service.js';
import { validateKpiType, validateRange } from '../middleware/validation.js';

const router: Router = Router();

router.get(
  '/api/trends/:kpiType',
  validateKpiType('kpiType'),
  validateRange,
  async (req, res, next) => {
    try {
      const rangeStr = (req.query.range as string) || '90d';
      const rangeDays = parseInt(rangeStr.replace('d', ''), 10);
      const teamSlug = req.query.team as string | undefined;

      const trends = await getTrends(req.params.kpiType, rangeDays, teamSlug);
      res.json(trends);
    } catch (error) {
      next(error);
    }
  },
);

export default router;

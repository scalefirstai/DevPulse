import { Router } from 'express';
import { getKpisForTeam, getKpiDetail } from '../services/kpi-service.js';
import { validateSlug, validateKpiType } from '../middleware/validation.js';

const router: Router = Router();

router.get('/api/kpis/:teamSlug', validateSlug('teamSlug'), async (req, res, next) => {
  try {
    const kpis = await getKpisForTeam(req.params.teamSlug);
    if (!kpis) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    res.json(kpis);
  } catch (error) {
    next(error);
  }
});

router.get(
  '/api/kpis/:teamSlug/:kpiType',
  validateSlug('teamSlug'),
  validateKpiType('kpiType'),
  async (req, res, next) => {
    try {
      const detail = await getKpiDetail(req.params.teamSlug, req.params.kpiType);
      if (!detail) {
        res.status(404).json({ error: 'KPI data not found' });
        return;
      }
      res.json(detail);
    } catch (error) {
      next(error);
    }
  },
);

export default router;

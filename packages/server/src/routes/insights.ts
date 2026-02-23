import { Router } from 'express';
import { getInsights, dismissInsight } from '../services/insight-service.js';
import { validateSeverity, validateUuid } from '../middleware/validation.js';

const router: Router = Router();

router.get('/api/insights', validateSeverity, async (req, res, next) => {
  try {
    const severity = req.query.severity as string | undefined;
    const insights = await getInsights(severity);
    res.json(insights);
  } catch (error) {
    next(error);
  }
});

router.post('/api/insights/:id/dismiss', validateUuid('id'), async (req, res, next) => {
  try {
    const dismissed = await dismissInsight(req.params.id);
    if (!dismissed) {
      res.status(404).json({ error: 'Insight not found or already dismissed' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

import { Router } from 'express';
import { query } from '../config/database.js';
import { validateThresholdBody } from '../middleware/validation.js';
import { writeLimiter } from '../middleware/rate-limiter.js';

const router: Router = Router();

router.get('/api/config/thresholds', async (_req, res, next) => {
  try {
    const result = await query<{
      team_id: string | null;
      kpi_type: string;
      elite_max: string;
      strong_max: string;
      moderate_max: string;
    }>('SELECT team_id, kpi_type, elite_max, strong_max, moderate_max FROM thresholds ORDER BY kpi_type');

    res.json(
      result.rows.map((row) => ({
        teamId: row.team_id,
        kpiType: row.kpi_type,
        eliteMax: parseFloat(row.elite_max),
        strongMax: parseFloat(row.strong_max),
        moderateMax: parseFloat(row.moderate_max),
      })),
    );
  } catch (error) {
    next(error);
  }
});

router.put('/api/config/thresholds', writeLimiter, validateThresholdBody, async (req, res, next) => {
  try {
    for (const [kpiType, thresholds] of Object.entries(req.body)) {
      const t = thresholds as { elite_max?: number; strong_max?: number; moderate_max?: number };
      await query(
        `INSERT INTO thresholds (team_id, kpi_type, elite_max, strong_max, moderate_max)
         VALUES (NULL, $1, $2, $3, $4)
         ON CONFLICT (team_id, kpi_type) DO UPDATE SET
           elite_max = COALESCE($2, thresholds.elite_max),
           strong_max = COALESCE($3, thresholds.strong_max),
           moderate_max = COALESCE($4, thresholds.moderate_max)`,
        [kpiType, t.elite_max, t.strong_max, t.moderate_max],
      );
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

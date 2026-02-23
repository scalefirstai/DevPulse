import { Router } from 'express';
import { query } from '../config/database.js';
import { calculateShiftWithVelocity, KpiType } from '@devpulse/core';
import { validateSlug } from '../middleware/validation.js';

const router: Router = Router();

router.get('/api/shifts/:teamSlug', validateSlug('teamSlug'), async (req, res, next) => {
  try {
    const teamResult = await query<{ id: string }>('SELECT id FROM teams WHERE slug = $1', [
      req.params.teamSlug,
    ]);
    if (teamResult.rows.length === 0) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }

    const teamId = teamResult.rows[0].id;
    const kpiTypes = Object.values(KpiType);
    const shifts = [];

    for (const kpiType of kpiTypes) {
      const result = await query<{ value: string }>(
        `SELECT value FROM kpi_snapshots
         WHERE team_id = $1 AND kpi_type = $2
         ORDER BY period_end DESC LIMIT 5`,
        [teamId, kpiType],
      );

      const values = result.rows.map((r) => parseFloat(r.value)).reverse();
      const shift = calculateShiftWithVelocity(kpiType, values);
      shifts.push(shift);
    }

    res.json(shifts);
  } catch (error) {
    next(error);
  }
});

export default router;

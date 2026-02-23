import { Router } from 'express';
import { query } from '../config/database.js';
import { calculateHealthScore, KpiType } from '@devpulse/core';

const router: Router = Router();

router.get('/api/health', async (_req, res, next) => {
  try {
    const result = await query<{ kpi_type: string; value: string }>(
      `SELECT ks.kpi_type, AVG(ks.value::numeric) as value
       FROM kpi_snapshots ks
       INNER JOIN (
         SELECT team_id, kpi_type, MAX(period_end) as max_period
         FROM kpi_snapshots
         GROUP BY team_id, kpi_type
       ) latest ON ks.team_id = latest.team_id
         AND ks.kpi_type = latest.kpi_type
         AND ks.period_end = latest.max_period
       GROUP BY ks.kpi_type`,
    );

    const kpiValues: Record<KpiType, number> = {
      [KpiType.CycleTime]: 0,
      [KpiType.DefectEscape]: 0,
      [KpiType.ArchDrift]: 0,
      [KpiType.Mttrc]: 0,
      [KpiType.Rework]: 0,
    };

    for (const row of result.rows) {
      const kpiType = row.kpi_type as KpiType;
      if (kpiType in kpiValues) {
        kpiValues[kpiType] = parseFloat(row.value);
      }
    }

    const healthScore = calculateHealthScore(kpiValues);
    res.json(healthScore);
  } catch (error) {
    next(error);
  }
});

export default router;

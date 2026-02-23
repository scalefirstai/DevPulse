import { Router } from 'express';
import { compareTeams } from '../services/comparison-service.js';

const router: Router = Router();

router.get('/api/compare', async (req, res, next) => {
  try {
    const teamsParam = req.query.teams as string;
    if (!teamsParam) {
      res.status(400).json({ error: 'teams query parameter is required' });
      return;
    }

    const teamSlugs = teamsParam.split(',').map((s) => s.trim());
    const kpi = req.query.kpi as string | undefined;

    const comparison = await compareTeams(teamSlugs, kpi);
    res.json(comparison);
  } catch (error) {
    next(error);
  }
});

export default router;

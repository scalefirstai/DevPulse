import { Router } from 'express';
import { query } from '../config/database.js';
import { validateUuid } from '../middleware/validation.js';
import { writeLimiter } from '../middleware/rate-limiter.js';

const router: Router = Router();

router.get('/api/teams', async (_req, res, next) => {
  try {
    const result = await query<{ id: string; name: string; slug: string; metadata: Record<string, unknown>; created_at: Date }>(
      'SELECT id, name, slug, metadata, created_at FROM teams ORDER BY name',
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/api/teams', writeLimiter, async (req, res, next) => {
  try {
    const { name, slug, metadata } = req.body;
    if (!name || !slug) {
      res.status(400).json({ error: 'name and slug are required' });
      return;
    }

    const result = await query<{ id: string; name: string; slug: string }>(
      'INSERT INTO teams (name, slug, metadata) VALUES ($1, $2, $3) RETURNING id, name, slug',
      [name, slug, metadata || {}],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put('/api/teams/:id', validateUuid('id'), writeLimiter, async (req, res, next) => {
  try {
    const { name, slug, metadata } = req.body;
    const result = await query(
      `UPDATE teams SET
         name = COALESCE($2, name),
         slug = COALESCE($3, slug),
         metadata = COALESCE($4, metadata)
       WHERE id = $1 RETURNING id, name, slug`,
      [req.params.id, name, slug, metadata],
    );

    if ((result.rowCount ?? 0) === 0) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete('/api/teams/:id', validateUuid('id'), writeLimiter, async (req, res, next) => {
  try {
    const result = await query('DELETE FROM teams WHERE id = $1', [req.params.id]);
    if ((result.rowCount ?? 0) === 0) {
      res.status(404).json({ error: 'Team not found' });
      return;
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

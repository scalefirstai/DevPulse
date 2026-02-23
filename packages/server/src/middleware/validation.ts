import { Request, Response, NextFunction } from 'express';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RANGE_PATTERN = /^\d+d$/;
const VALID_KPI_TYPES = ['cycle_time', 'defect_escape', 'arch_drift', 'mttrc', 'rework'];
const VALID_SEVERITIES = ['info', 'warning', 'critical'];

export function validateSlug(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    if (value && !SLUG_PATTERN.test(value)) {
      res.status(400).json({ error: `Invalid ${paramName} format` });
      return;
    }
    next();
  };
}

export function validateUuid(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    if (value && !UUID_PATTERN.test(value)) {
      res.status(400).json({ error: `Invalid ${paramName} format. Expected UUID.` });
      return;
    }
    next();
  };
}

export function validateRange(req: Request, res: Response, next: NextFunction): void {
  const range = req.query.range as string | undefined;
  if (range && !RANGE_PATTERN.test(range)) {
    res.status(400).json({ error: 'Range must be in format: <number>d (e.g., 90d)' });
    return;
  }
  next();
}

export function validateKpiType(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.params[paramName];
    if (value && !VALID_KPI_TYPES.includes(value)) {
      res.status(400).json({
        error: `Invalid KPI type. Must be one of: ${VALID_KPI_TYPES.join(', ')}`,
      });
      return;
    }
    next();
  };
}

export function validateSeverity(req: Request, res: Response, next: NextFunction): void {
  const severity = req.query.severity as string | undefined;
  if (severity && !VALID_SEVERITIES.includes(severity)) {
    res.status(400).json({
      error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(', ')}`,
    });
    return;
  }
  next();
}

export function validateThresholdBody(req: Request, res: Response, next: NextFunction): void {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Request body must be a JSON object' });
    return;
  }

  for (const [kpiType, thresholds] of Object.entries(body)) {
    if (!VALID_KPI_TYPES.includes(kpiType)) {
      res.status(400).json({ error: `Invalid KPI type: ${kpiType}` });
      return;
    }

    const t = thresholds as Record<string, unknown>;
    for (const field of ['elite_max', 'strong_max', 'moderate_max']) {
      if (t[field] !== undefined && typeof t[field] !== 'number') {
        res.status(400).json({ error: `${field} must be a number` });
        return;
      }
    }

    if (
      typeof t.elite_max === 'number' &&
      typeof t.strong_max === 'number' &&
      t.elite_max >= t.strong_max
    ) {
      res.status(400).json({ error: 'elite_max must be less than strong_max' });
      return;
    }
    if (
      typeof t.strong_max === 'number' &&
      typeof t.moderate_max === 'number' &&
      t.strong_max >= t.moderate_max
    ) {
      res.status(400).json({ error: 'strong_max must be less than moderate_max' });
      return;
    }
  }

  next();
}

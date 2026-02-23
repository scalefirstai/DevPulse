import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual, createHash } from 'crypto';

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return timingSafeEqual(bufA, bufB);
}

export function apiKeyAuth(apiKeyHash: string | null) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!apiKeyHash) {
      next();
      return;
    }

    const apiKey = req.headers['x-api-key'] as string | undefined;

    if (!apiKey) {
      res.status(401).json({ error: 'API key required' });
      return;
    }

    const providedHash = hashKey(apiKey);
    if (!constantTimeCompare(providedHash, apiKeyHash)) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    next();
  };
}

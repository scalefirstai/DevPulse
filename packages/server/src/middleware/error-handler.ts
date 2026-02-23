import { Request, Response, NextFunction } from 'express';

const SECRET_PATTERNS = [
  /token/i,
  /password/i,
  /secret/i,
  /api.?key/i,
  /credential/i,
];

function redactSecrets(message: string): string {
  let redacted = message;
  for (const pattern of SECRET_PATTERNS) {
    redacted = redacted.replace(
      new RegExp(`(${pattern.source})\\s*[:=]\\s*\\S+`, 'gi'),
      '$1: [REDACTED]',
    );
  }
  return redacted;
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const safeMessage = redactSecrets(err.message);
  console.error('[Error]', safeMessage);

  const statusCode = 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? 'Something went wrong. Please try again.' : safeMessage,
  });
}

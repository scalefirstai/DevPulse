const REQUIRED_VARS = ['DATABASE_URL'] as const;

interface EnvConfig {
  databaseUrl: string;
  redisUrl: string;
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  apiKeyHash: string | null;
}

export function validateEnv(): EnvConfig {
  const missing: string[] = [];
  for (const name of REQUIRED_VARS) {
    if (!process.env[name]) {
      missing.push(name);
    }
  }
  if (missing.length > 0) {
    console.error(`Missing required environment variable(s): ${missing.join(', ')}`);
    process.exit(1);
  }

  return {
    databaseUrl: process.env.DATABASE_URL!,
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    port: parseInt(process.env.PORT || '4000', 10),
    nodeEnv: (process.env.NODE_ENV as EnvConfig['nodeEnv']) || 'development',
    apiKeyHash: process.env.API_KEY_HASH || null,
  };
}

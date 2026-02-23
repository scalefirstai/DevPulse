import IORedis from 'ioredis';

let connection: IORedis | null = null;

export function initRedis(url: string): IORedis {
  connection = new IORedis(url, {
    maxRetriesPerRequest: null,
  });
  return connection;
}

export function getRedisConnection(): IORedis {
  if (!connection) {
    throw new Error('Redis not initialized. Call initRedis() first.');
  }
  return connection;
}

export async function closeRedis(): Promise<void> {
  if (connection) {
    await connection.quit();
    connection = null;
  }
}

import { Pool, QueryResult } from 'pg';

let pool: Pool;

export function initDatabase(connectionString: string): Pool {
  pool = new Pool({ connectionString });
  return pool;
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  return getPool().query<T>(text, params);
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
  }
}

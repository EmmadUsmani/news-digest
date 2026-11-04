import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import Redis from 'ioredis';
import { Pool } from 'pg';

import { observeClientQueries } from './slow-queries';
function assertTestIsolation() {
  if (
    process.env.NODE_TEST_CONTEXT &&
    process.env.NEWS_DIGEST_ISOLATED_TEST !== '1'
  ) {
    throw new Error(
      'Run tests with pnpm test to use disposable Postgres and Redis',
    );
  }
}
export function database() {
  assertTestIsolation();
  const pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      'postgres://postgres@127.0.0.1:5432/news_digest',
    connectionTimeoutMillis: 3000,
  });
  pool.on('connect', observeClientQueries);
  return pool;
}
export function redis() {
  assertTestIsolation();
  return new Redis(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379', {
    maxRetriesPerRequest: 1,
    connectTimeout: 3000,
  });
}

export async function checkDatabase(pool: Pool): Promise<void> {
  // A constant probe deliberately checks connectivity without reading app tables.
  await drizzle(pool).execute(sql`SELECT 1`);
}

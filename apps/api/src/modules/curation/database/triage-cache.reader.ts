import { inArray } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { PoolClient } from 'pg';

import { llmCache } from '../../../libs/db/schema';

// Reuse the caller's read-only snapshot, without ledger admission or writes.
export function triageCacheReader(db: Pick<PoolClient, 'query'>) {
  const cachedMany = async (keys: string[]): Promise<Map<string, unknown>> => {
    if (!keys.length) return new Map();
    const rows = await drizzle(db as PoolClient)
      .select({ key: llmCache.cacheKey, response: llmCache.response })
      .from(llmCache)
      .where(inArray(llmCache.cacheKey, [...new Set(keys)]));
    return new Map(rows.map((row) => [row.key, row.response]));
  };
  return {
    cachedMany,
    cached: async (key: string) => (await cachedMany([key])).get(key),
  };
}

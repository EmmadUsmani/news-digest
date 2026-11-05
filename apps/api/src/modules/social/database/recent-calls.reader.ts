import { desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';

import { xDiscoveryCalls as calls } from '../../../libs/db/schema';

export async function readRecentXCalls(db: Pool) {
  const recentRows = await drizzle(db)
    .select({
      id: calls.id,
      createdAt: calls.createdAt,
      model: calls.model,
      purpose: calls.purpose,
      status: calls.status,
      costMicros: calls.costMicros,
      reservedMicros: calls.reservedMicros,
      inputTokens: calls.inputTokens,
      outputTokens: calls.outputTokens,
    })
    .from(calls)
    .orderBy(desc(calls.createdAt), desc(calls.id))
    .limit(20);
  return recentRows.map((row) => ({
    ...row,
    status: row.status as 'pending' | 'succeeded' | 'failed' | 'uncertain',
    createdAt: new Date(row.createdAt).toISOString(),
    reservedMicros: ['pending', 'uncertain'].includes(row.status)
      ? row.reservedMicros
      : 0,
  }));
}

import type { Pool } from 'pg';

import { readRecentXCalls } from '../database/recent-calls.reader';
import { PostgresXDiscoveryLedger } from '../database/x-discovery.ledger';

export async function readXDiscoveryUsage(db: Pool) {
  return {
    ...(await new PostgresXDiscoveryLedger(db).status()),
    recentCalls: await readRecentXCalls(db),
  };
}

export { xDiscoveryCaps } from '../domain/x-discovery-budget';

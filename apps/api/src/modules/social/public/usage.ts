import type { Pool } from 'pg';

import { PostgresXDiscoveryLedger } from '../database/x-discovery.ledger';

export function readXDiscoveryUsage(db: Pool) {
  return new PostgresXDiscoveryLedger(db).status();
}

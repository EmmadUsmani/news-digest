import type { Pool } from 'pg';

import { PostgresDevelopmentSpendRepository } from '../database/development-spend.repository';

/** Read-only lifetime totals; no provider calls or production accounting. */
export function readDevelopmentSpend(db: Pool) {
  const ledger = new PostgresDevelopmentSpendRepository(db);
  return Promise.all([ledger.status('anthropic'), ledger.status('xai')]);
}

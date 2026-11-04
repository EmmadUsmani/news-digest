import type { Pool } from 'pg';

import { llmConfig } from '../adapters/config';
import { readLlmUsageSnapshot } from '../database/usage-snapshot.reader';

export function readLlmUsage(db: Pool, env: NodeJS.ProcessEnv = process.env) {
  return readLlmUsageSnapshot(db, env);
}

// Configured ceilings only; the ledger can lower today's actual allowance.
export function configuredLlmCaps(env: NodeJS.ProcessEnv = process.env) {
  const { monthly, dailyMax } = llmConfig(env).caps;
  return { monthlyMicros: monthly, dailyMicros: dailyMax };
}

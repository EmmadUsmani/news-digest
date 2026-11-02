import type { Pool } from 'pg';

import { scheduledReserveConfig } from '../adapters/config';
import { PostgresLlmLedger } from '../database/llm.ledger';
import type { BudgetCaps } from '../domain/budget';
import { scheduledLedgerContext } from './scheduled-context';

// All production Anthropic callers share policy and trusted worker context.
// Direct construction remains available for isolated repository characterization.
export function configuredLlmLedger(
  db: Pool,
  caps: BudgetCaps,
  verification = false,
  env: NodeJS.ProcessEnv = process.env,
) {
  const config = scheduledReserveConfig(env);
  return new PostgresLlmLedger(
    db,
    caps,
    verification,
    config.enabled
      ? { policy: config.policy, context: scheduledLedgerContext }
      : undefined,
  );
}

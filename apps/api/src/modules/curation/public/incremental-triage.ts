import type { Pool } from 'pg';

import { AnthropicLlmAdapter } from '../adapters/anthropic';
import { llmConfig, scheduledReserveConfig } from '../adapters/config';
import { BudgetedLlm } from '../application/budgeted-llm';
import { CandidateTriage } from '../application/triage';
import { configuredLlmLedger } from './ledger';
import { withEditionRun } from './scheduled-context';

// Background work must never inherit the scheduled worker's reserve privilege.
// A separate BudgetedLlm also prevents joining a privileged in-flight request.
export function backgroundTriage(triage: Pick<CandidateTriage, 'score'>) {
  return {
    score(...args: Parameters<CandidateTriage['score']>) {
      return withEditionRun(undefined, args[2], () => triage.score(...args));
    },
  };
}

// Prepared entry point only: no collector or scheduler invokes it yet.
export function incrementalTriageServices(
  db: Pool,
  env: NodeJS.ProcessEnv = process.env,
) {
  const enabled = env.LLM_INCREMENTAL_TRIAGE_ENABLED ?? '0';
  if (!['0', '1'].includes(enabled))
    throw new Error('Invalid LLM_INCREMENTAL_TRIAGE_ENABLED');
  if (enabled === '0') return null;
  if (!scheduledReserveConfig(env).enabled)
    throw new Error('Incremental triage requires the scheduled budget reserve');
  if (!env.ANTHROPIC_API_KEY) return null;
  const config = llmConfig(env);
  const ledger = configuredLlmLedger(db, config.caps, false, env);
  const llm = new BudgetedLlm(
    new AnthropicLlmAdapter(env.ANTHROPIC_API_KEY),
    ledger,
  );
  return backgroundTriage(new CandidateTriage(llm, ledger, config.haiku));
}

import { randomUUID } from 'node:crypto';
import { isAbsolute } from 'node:path';

import type { Pool } from 'pg';

import { AnthropicLlmAdapter } from '../adapters/anthropic';
import { llmConfig, scheduledReserveConfig } from '../adapters/config';
import { exportTriageEvidence } from '../adapters/triage-evidence-file';
import { BudgetedLlm } from '../application/budgeted-llm';
import { CandidateTriage } from '../application/triage';
import { triageWorkEvidence } from '../application/triage-work-evidence';
import type { LlmLedger } from '../domain/llm-ledger.port';
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

// One recorder per invocation, including overlapping topics. Export partial
// writes on scoring failure; propagate export errors so evidence loss is visible.
export function evidencedBackgroundTriage(
  cache: Pick<LlmLedger, 'cached' | 'cache'>,
  create: (
    cache: Pick<LlmLedger, 'cached' | 'cache'>,
  ) => Pick<CandidateTriage, 'score'>,
  persist: (
    rows: ReturnType<ReturnType<typeof triageWorkEvidence>['attempts']>,
  ) => Promise<unknown>,
) {
  return backgroundTriage({
    async score(...args) {
      const evidence = triageWorkEvidence(cache, {
        topicId: args[0].id,
        attemptId: randomUUID(),
      });
      let result: Awaited<ReturnType<CandidateTriage['score']>>;
      try {
        result = await create(evidence.cache).score(...args);
      } catch (scoringError) {
        try {
          await persist(evidence.attempts());
        } catch (exportError) {
          throw new AggregateError(
            [scoringError, exportError],
            'Scoring and evidence export failed',
          );
        }
        throw scoringError;
      }
      await persist(evidence.attempts());
      return result;
    },
  });
}

// Optional worker entry point; background scoring remains disabled by default.
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
  if (!env.ANTHROPIC_API_KEY?.trim())
    throw new Error('Incremental triage requires ANTHROPIC_API_KEY');
  const directory = env.LLM_INCREMENTAL_TRIAGE_EVIDENCE_DIRECTORY;
  if (!directory || !isAbsolute(directory))
    throw new Error(
      'Incremental triage requires an absolute evidence directory',
    );
  const config = llmConfig(env);
  const ledger = configuredLlmLedger(db, config.caps, false, env);
  const llm = new BudgetedLlm(
    new AnthropicLlmAdapter(env.ANTHROPIC_API_KEY),
    ledger,
  );
  const triage = new CandidateTriage(llm, ledger, config.haiku);
  return {
    pending: triage.pending.bind(triage),
    ...evidencedBackgroundTriage(
      ledger,
      (cache) => new CandidateTriage(llm, cache, config.haiku),
      (rows) => exportTriageEvidence(directory, rows),
    ),
  };
}

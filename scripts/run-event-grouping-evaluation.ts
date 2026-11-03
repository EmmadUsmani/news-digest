// Explicit once-only paid evaluation; never imported by an app or scheduler.
import { randomUUID } from 'node:crypto';

import { eventGroupingEvaluationLedger } from '../apps/api/scripts/event-grouping-evaluation-ledger';
import { runEventGroupingEvaluationOnce } from '../apps/api/scripts/event-grouping-evaluation-once';
import {
  checkEvaluationStateDirectory,
  evaluationStateDirectory,
} from '../apps/api/scripts/event-grouping-evaluation-state';
import {
  eventGroupingEvaluationPlan,
  runEventGroupingEvaluation,
} from '../apps/api/scripts/run-event-grouping-evaluation';
import { database } from '../apps/api/src/libs/db/connections';
import { AnthropicLlmAdapter } from '../apps/api/src/modules/curation/adapters/anthropic';
import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { BudgetedLlm } from '../apps/api/src/modules/curation/application/budgeted-llm';
import { EventGrouping } from '../apps/api/src/modules/curation/application/event-grouping';
import { configuredLlmLedger } from '../apps/api/src/modules/curation/public/ledger';

async function main() {
  if (process.argv.length !== 2 || process.env.LLM_LIVE !== '1')
    throw new Error('Requires LLM_LIVE=1 and no arguments');
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('Load the configured secrets environment');
  eventGroupingEvaluationPlan();
  await checkEvaluationStateDirectory();
  const config = llmConfig();
  const runId = 'item-26-evaluation-' + randomUUID();
  const db = database();
  try {
    const ledger = eventGroupingEvaluationLedger(
      configuredLlmLedger(db, config.caps, true),
      {
        live: process.env.LLM_LIVE,
        runId,
        modelId: config.haiku.id,
        capMicros: 100000,
      },
    );
    // Preflight connectivity before consuming the durable authorization.
    await db.query('SELECT 1');
    const grouping = new EventGrouping(
      new BudgetedLlm(new AnthropicLlmAdapter(key), ledger),
      config.haiku,
    );
    const result = await runEventGroupingEvaluationOnce(
      evaluationStateDirectory,
      async () => ({
        runId,
        model: config.haiku.id,
        startedAt: new Date().toISOString(),
        ...(await runEventGroupingEvaluation(grouping, runId)),
      }),
    );
    console.log(JSON.stringify({ runId, report: result.report }));
  } finally {
    await db.end();
  }
}
void main().catch(() => {
  // Never print SDK/database exception text, connection strings or credentials.
  console.error(
    'Evaluation stopped; inspect the persistent claim/report and ledger. Do not remove the claim or retry paid calls.',
  );
  process.exitCode = 1;
});

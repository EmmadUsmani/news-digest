// Explicit STEERING 54 replay; never imported by runtime or tests.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

import { runEventGroupingEvaluationOnce } from '../apps/api/scripts/event-grouping-evaluation-once';
import { database } from '../apps/api/src/libs/db/connections';
import { AnthropicLlmAdapter } from '../apps/api/src/modules/curation/adapters/anthropic';
import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { BudgetedLlm } from '../apps/api/src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../apps/api/src/modules/curation/application/editor';
import { PostgresLlmLedger } from '../apps/api/src/modules/curation/database/llm.ledger';
import type { LlmRequest } from '../apps/api/src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../apps/api/src/modules/curation/domain/llm-ledger.port';

const directory = '/home/exedev/.local/state/news-digest/item-54-nba';
async function main() {
  assert.deepEqual(process.argv.slice(2), ['--owner-sonnet-trial']);
  const artifact = JSON.parse(
    await readFile('/tmp/nba-reconstruction/editor-verified.json', 'utf8'),
  ) as { requests: LlmRequest[] };
  assert.equal(artifact.requests.length, 2);
  const original = artifact.requests[0];
  const input = JSON.parse(original.prompt);
  assert.equal(input.topic.name, 'NBA');
  const config = llmConfig();
  assert.equal(original.model.id, config.sonnet.id);
  assert.equal(process.env.LLM_LIVE, '1');
  assert.ok(process.env.ANTHROPIC_API_KEY);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const db = database();
  try {
    const recoveryDirectory = `${directory}/sonnet-owner-trial`;
    await mkdir(recoveryDirectory, { mode: 0o700 });
    const runId = 'item-54-sonnet-' + randomUUID();
    const prior = await db.query(
      "SELECT status, cost_micros FROM llm_calls WHERE run_id LIKE 'item-54-%'",
    );
    assert.equal(prior.rows.length, 4);
    assert.ok(prior.rows.every((row) => row.status === 'succeeded'));
    const previousSpend = prior.rows.reduce(
      (sum, row) => sum + Number(row.cost_micros),
      0,
    );
    assert.equal(previousSpend, 7871);
    const daily = await db.query(
      "SELECT coalesce(sum(cost_micros),0) AS used FROM llm_calls WHERE purpose='verification' AND created_at >= date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'",
    );
    let reserved = previousSpend;
    let calls = 0;
    const shared = new PostgresLlmLedger(
      db,
      config.caps,
      true,
      undefined,
      undefined,
      {
        runId,
        dailyLimitMicros: Number(daily.rows[0].used) + 250000 - previousSpend,
      },
    );
    const ledger: LlmLedger = {
      reserve(request, estimate) {
        assert.equal(request.runId, runId);
        assert.equal(request.purpose, 'shortlist-editor-v14-nba');
        assert.ok(Number.isSafeInteger(estimate) && estimate > 0);
        const hour = new Date().getUTCHours();
        assert.ok(hour < 13 || hour >= 16);
        if (estimate > 250000 - reserved) return Promise.resolve(null);
        reserved += estimate; // Never refund uncertain or refused reservations.
        return shared.reserve(request, estimate);
      },
      settle: (id, usage, cost) => shared.settle(id, usage, cost),
      fail: (id, code, limit, uncertain) =>
        shared.fail(id, code, limit, uncertain),
      cached: () => Promise.resolve(undefined),
      cache: () => Promise.resolve(), // Keep replay out of production cache.
    };
    const provider = new AnthropicLlmAdapter(process.env.ANTHROPIC_API_KEY);
    const llm = new BudgetedLlm(
      {
        async complete(request) {
          const response = await provider.complete(request);
          calls++;
          await writeFile(
            `${recoveryDirectory}/response-${calls}.json`,
            JSON.stringify({ request, response }, null, 2),
            { mode: 0o600, flag: 'wx' },
          );
          return response;
        },
      },
      ledger,
    );
    const report = await runEventGroupingEvaluationOnce(
      recoveryDirectory,
      async () => {
        const runs = [];
        for (let attempt = 1; attempt <= 3; attempt++) {
          const editor = new ShortlistEditor(llm, config.sonnet, config.haiku);
          const result = await editor.edit(
            input.topic,
            input.candidates,
            input.budget,
            runId,
          );
          runs.push({
            attempt,
            result,
            diagnostics: llm.validationDiagnostics(),
          });
        }
        const result = runs.at(-1)?.result ?? null;
        return {
          runs,
          runId,
          reserved,
          calls,
          result,
          diagnostics: llm.validationDiagnostics(),
        };
      },
    );
    console.log(
      JSON.stringify({
        runId,
        reserved,
        calls,
        validated: report.result !== null,
        diagnostics: report.diagnostics,
      }),
    );
  } finally {
    await db.end();
  }
}
void main().catch(() => {
  console.error(
    'Replay stopped. Inspect private item-54-nba claim/report and ledger; never delete the claim or repeat paid calls.',
  );
  process.exitCode = 1;
});

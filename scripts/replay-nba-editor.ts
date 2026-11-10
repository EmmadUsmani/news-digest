// Explicit STEERING 54 replay; never imported by runtime or tests.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';

import { runEventGroupingEvaluationOnce } from '../apps/api/scripts/event-grouping-evaluation-once';
import { database } from '../apps/api/src/libs/db/connections';
import { AnthropicLlmAdapter } from '../apps/api/src/modules/curation/adapters/anthropic';
import { llmConfig } from '../apps/api/src/modules/curation/adapters/config';
import { BudgetedLlm } from '../apps/api/src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../apps/api/src/modules/curation/application/editor';
import type { LlmRequest } from '../apps/api/src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../apps/api/src/modules/curation/domain/llm-ledger.port';
import { configuredLlmLedger } from '../apps/api/src/modules/curation/public/ledger';

const directory = '/home/exedev/.local/state/news-digest/item-54-nba';
async function main() {
  const preflight = process.argv[2] === '--preflight';
  const corrected = process.argv[2] === '--verify-v14-once';
  assert.deepEqual(process.argv.slice(2), [
    preflight
      ? '--preflight'
      : corrected
        ? '--verify-v14-once'
        : '--verify-once',
  ]);
  const artifact = JSON.parse(
    await readFile('/tmp/nba-reconstruction/editor-verified.json', 'utf8'),
  ) as { requests: LlmRequest[] };
  assert.equal(artifact.requests.length, 2);
  const original = artifact.requests[0];
  const input = JSON.parse(original.prompt);
  assert.equal(input.topic.name, 'NBA');
  const config = llmConfig();
  assert.equal(original.model.id, config.sonnet.id);
  if (preflight) {
    let admissions = 0;
    const offline = new BudgetedLlm(
      { complete: () => Promise.reject(new Error('Provider forbidden')) },
      {
        reserve: () => {
          admissions++;
          return Promise.resolve(null);
        },
        cached: () => Promise.resolve(undefined),
        cache: () => Promise.reject(new Error('Cache writes forbidden')),
        settle: () => Promise.reject(new Error('Settlement forbidden')),
        fail: () => Promise.reject(new Error('Failure writes forbidden')),
      },
    );
    const result = await new ShortlistEditor(
      offline,
      config.sonnet,
      config.haiku,
    ).edit(input.topic, input.candidates, input.budget, 'offline-preflight');
    assert.equal(result, null);
    assert.equal(admissions, 2);
    assert.deepEqual(offline.validationDiagnostics(), []);
    console.log(
      'NBA replay preflight: both models reach admission; no provider, ledger, cache or claim writes.',
    );
    return;
  }
  assert.equal(process.env.LLM_LIVE, '1');
  assert.ok(process.env.ANTHROPIC_API_KEY);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  // Keep the original failed claim forever. Recovery has its own fixed,
  // exclusive claim and is allowed only for the audited pre-provider failure.
  assert.equal(
    await readFile(`${directory}/item-27-evaluation.claim`, 'utf8'),
    'Owner-authorized item 27 evaluation claimed\n',
  );
  assert.deepEqual((await readdir(directory)).sort(), [
    'item-27-evaluation.claim',
    ...(corrected ? ['unspent-recovery'] : []),
  ]);
  const db = database();
  try {
    const prior = await db.query('SELECT id FROM llm_calls WHERE run_id = $1', [
      'item-54-nba-8837dd87-743a-4def-b3d9-194f3a0795e6',
    ]);
    assert.equal(prior.rows.length, 0);
    let previousSpend = 0;
    if (corrected) {
      const previous = JSON.parse(
        await readFile(
          `${directory}/unspent-recovery/item-27-evaluation.json`,
          'utf8',
        ),
      ) as { runId: string; calls: number; result: unknown };
      assert.equal(
        previous.runId,
        'item-54-nba-29add5c8-cdc6-443d-b2e1-30930d58cd54',
      );
      assert.equal(previous.calls, 2);
      assert.equal(previous.result, null);
      const audit = await db.query(
        `SELECT status, cost_micros FROM llm_calls WHERE run_id = $1`,
        [previous.runId],
      );
      assert.equal(audit.rows.length, 2);
      for (const row of audit.rows) {
        assert.equal(row.status, 'succeeded');
        assert.ok(
          Number.isSafeInteger(Number(row.cost_micros)) &&
            Number(row.cost_micros) > 0,
        );
        previousSpend += Number(row.cost_micros);
      }
      assert.equal(previousSpend, 3913);
    }
    const recoveryDirectory = `${directory}/${corrected ? 'v14-replay' : 'unspent-recovery'}`;
    await mkdir(recoveryDirectory, { mode: 0o700 });
    const runId = 'item-54-nba-' + randomUUID();
    let reserved = previousSpend;
    let calls = 0;
    const shared = configuredLlmLedger(db, config.caps, true);
    const ledger: LlmLedger = {
      reserve(request, estimate) {
        assert.equal(request.runId, runId);
        assert.equal(request.purpose, 'shortlist-editor-v14-nba');
        assert.ok(Number.isSafeInteger(estimate) && estimate > 0);
        const hour = new Date().getUTCHours();
        assert.ok(hour < 13 || hour >= 16);
        if (estimate > 100000 - reserved) return Promise.resolve(null);
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
        const editor = new ShortlistEditor(llm, config.sonnet, config.haiku);
        const result = await editor.edit(
          input.topic,
          input.candidates,
          input.budget,
          runId,
        );
        return {
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

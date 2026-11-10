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
import type { LlmRequest } from '../apps/api/src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../apps/api/src/modules/curation/domain/llm-ledger.port';
import { configuredLlmLedger } from '../apps/api/src/modules/curation/public/ledger';

const directory = '/home/exedev/.local/state/news-digest/item-54-nba';
async function main() {
  const preflight = process.argv[2] === '--preflight';
  assert.deepEqual(process.argv.slice(2), [
    preflight ? '--preflight' : '--verify-once',
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
  const db = database();
  const runId = 'item-54-nba-' + randomUUID();
  let reserved = 0;
  let calls = 0;
  const shared = configuredLlmLedger(db, config.caps, true);
  const ledger: LlmLedger = {
    reserve(request, estimate) {
      assert.equal(request.runId, runId);
      assert.equal(request.purpose, 'shortlist-editor-v13');
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
          `${directory}/response-${calls}.json`,
          JSON.stringify({ request, response }, null, 2),
          { mode: 0o600, flag: 'wx' },
        );
        return response;
      },
    },
    ledger,
  );
  try {
    const report = await runEventGroupingEvaluationOnce(directory, async () => {
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
    });
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

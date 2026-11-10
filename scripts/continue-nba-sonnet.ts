// One-time continuation of the owner-approved STEERING 54 Sonnet trial.
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

const root = '/home/exedev/.local/state/news-digest/item-54-nba';
const ceiling = 250_000;

async function main() {
  assert.deepEqual(process.argv.slice(2), ['--after-utc-reset']);
  assert.equal(process.env.LLM_LIVE, '1');
  assert.ok(process.env.ANTHROPIC_API_KEY);
  assert.ok(new Date().toISOString() >= '2026-11-11T00:00:00.000Z');
  assert.ok(new Date().toISOString() < '2026-11-11T12:00:00.000Z');
  const originalReport = JSON.parse(
    await readFile(
      `${root}/sonnet-owner-trial/item-27-evaluation.json`,
      'utf8',
    ),
  ) as { runs: unknown[]; calls: number };
  assert.equal(originalReport.runs.length, 3);
  assert.equal(originalReport.calls, 3);
  const artifact = JSON.parse(
    await readFile('/tmp/nba-reconstruction/editor-verified.json', 'utf8'),
  ) as { requests: LlmRequest[] };
  assert.equal(artifact.requests.length, 2);
  const input = JSON.parse(artifact.requests[0].prompt);
  assert.equal(input.topic.name, 'NBA');
  const config = llmConfig();
  assert.equal(artifact.requests[0].model.id, config.sonnet.id);
  const db = database();
  try {
    const prior = await db.query(
      "SELECT status, cost_micros FROM llm_calls WHERE run_id LIKE 'item-54-%'",
    );
    assert.equal(prior.rows.length, 7);
    assert.ok(prior.rows.every((row) => row.status === 'succeeded'));
    const previousSpend = prior.rows.reduce(
      (sum, row) => sum + Number(row.cost_micros),
      0,
    );
    assert.equal(previousSpend, 44_978);
    const daily = await db.query(
      "SELECT coalesce(sum(cost_micros),0) AS used FROM llm_calls WHERE purpose='verification' AND created_at >= date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'",
    );
    const directory = `${root}/sonnet-owner-continuation`;
    await mkdir(directory, { mode: 0o700 });
    const runId = 'item-54-sonnet-continuation-' + randomUUID();
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
        dailyLimitMicros: Number(daily.rows[0].used) + ceiling - previousSpend,
      },
    );
    const ledger: LlmLedger = {
      reserve(request, estimate) {
        assert.equal(request.runId, runId);
        assert.equal(request.purpose, 'shortlist-editor-v14-nba');
        assert.ok(Number.isSafeInteger(estimate) && estimate > 0);
        assert.ok(new Date().toISOString() < '2026-11-11T12:00:00.000Z');
        if (estimate > ceiling - reserved) return Promise.resolve(null);
        reserved += estimate; // Uncertain and refused reservations stay consumed.
        return shared.reserve(request, estimate);
      },
      settle: (id, usage, cost) => shared.settle(id, usage, cost),
      fail: (id, code, limit, uncertain) =>
        shared.fail(id, code, limit, uncertain),
      cached: () => Promise.resolve(undefined),
      cache: () => Promise.resolve(),
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
    const report = await runEventGroupingEvaluationOnce(directory, async () => {
      const runs = [];
      for (let attempt = 2; attempt <= 3; attempt++) {
        const start = llm.validationDiagnostics().length;
        const before = calls;
        const result = await new ShortlistEditor(
          llm,
          config.sonnet,
          config.haiku,
        ).edit(input.topic, input.candidates, input.budget, runId);
        runs.push({
          attempt,
          result,
          calls: calls - before,
          diagnostics: llm.validationDiagnostics().slice(start),
        });
      }
      return { runId, previousSpend, reserved, calls, runs };
    });
    console.log(
      JSON.stringify({
        runId,
        previousSpend,
        reserved,
        calls,
        runs: report.runs.map((run) => ({
          attempt: run.attempt,
          validated: run.result !== null,
          calls: run.calls,
          diagnostics: run.diagnostics,
        })),
      }),
    );
  } finally {
    await db.end();
  }
}

void main().catch(() => {
  console.error(
    'Continuation stopped. Inspect private claim/report and settled ledger; never reuse the claim.',
  );
  process.exitCode = 1;
});

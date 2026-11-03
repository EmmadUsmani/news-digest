import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Pool } from 'pg';

import { createLogger } from '../src/libs/observability/logging';
import { llmConfig } from '../src/modules/curation/adapters/config';
import { PostgresLlmLedger } from '../src/modules/curation/database/llm.ledger';

void test('reserve logs report committed policy and admission without request content', async () => {
  for (const scenario of [
    'manual',
    'scheduled',
    'released',
    'blocked',
    'rollback',
    'disabled',
  ] as const) {
    const lines: string[] = [];
    let committed = false;
    const log = createLogger(
      'test',
      {
        write: (line) => {
          assert.ok(committed, 'never log a decision before commit');
          lines.push(line);
        },
      },
      [],
    );
    const db = {
      connect: async () => ({
        release() {},
        async query(sql: string) {
          if (sql === 'COMMIT') {
            if (scenario === 'rollback')
              throw new Error('private database failure');
            committed = true;
          }
          if (sql.includes('clock_timestamp() AS now'))
            return { rows: [{ now: new Date('2026-11-03T06:00:00Z') }] };
          if (sql.includes('FROM llm_provider_blocks'))
            return { rows: [], rowCount: scenario === 'blocked' ? 1 : 0 };
          if (sql.includes('AS month,'))
            return { rows: [{ month: 0, today: 0 }] };
          if (sql.includes('SELECT run_id,state,attempt'))
            return {
              rows: [
                {
                  run_id: 'slot',
                  state: scenario === 'released' ? 'succeeded' : 'running',
                  attempt: 1,
                },
              ],
            };
          return { rows: [], rowCount: 1 };
        },
      }),
    } as unknown as Pool;
    const ledger = new PostgresLlmLedger(
      db,
      { monthly: 30e6, dailyMax: 100000 },
      false,
      scenario === 'disabled'
        ? undefined
        : {
            policy: { configuredMicros: 80000, headroom: 1.5 },
            context: () =>
              scenario === 'scheduled'
                ? { runId: 'slot', attempt: 1, editionRunId: 'edition' }
                : undefined,
          },
      log,
    );
    const work = ledger.reserve(
      {
        model: llmConfig({}).haiku,
        purpose: 'private purpose',
        runId: 'edition',
        instructions: 'private instructions',
        prompt: 'private prompt',
        maxOutputTokens: 1,
      },
      30000,
    );
    if (scenario === 'rollback') await assert.rejects(work);
    else
      assert.equal(
        (await work) !== null,
        ['scheduled', 'released', 'disabled'].includes(scenario),
      );
    if (scenario === 'rollback' || scenario === 'disabled') {
      assert.equal(lines.length, 0);
      continue;
    }
    assert.equal(lines.length, 1);
    assert.ok(!lines.join('').includes('private'));
    const entry = JSON.parse(lines[0]);
    assert.equal(entry.event, 'budget.reserve-decision');
    assert.equal(entry.scheduledRun, scenario === 'scheduled');
    assert.equal(entry.reserveMicros, scenario === 'released' ? 0 : 80000);
    assert.equal(
      entry.reserveInsufficient,
      ['manual', 'blocked'].includes(scenario),
    );
    assert.equal(
      entry.outcome,
      ['manual', 'blocked'].includes(scenario) ? 'refused' : 'admitted',
    );
    assert.equal(
      entry.availableMicros,
      ['scheduled', 'released'].includes(scenario) ? 100000 : 20000,
    );
  }
});

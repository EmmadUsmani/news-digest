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
        async query(query: string | { text: string }) {
          const sql = typeof query === 'string' ? query : query.text;
          if (sql.toUpperCase() === 'COMMIT') {
            if (scenario === 'rollback')
              throw new Error('private database failure');
            committed = true;
          }
          if (sql.includes('clock_timestamp()'))
            return { rows: [[new Date('2026-11-03T06:00:00Z')]] };
          if (sql.includes('from "llm_provider_blocks"'))
            return { rows: scenario === 'blocked' ? [['2026-11-01']] : [] };
          if (sql.includes('sum(case when')) return { rows: [[0, 0]] };
          if (sql.includes('from "scheduled_ai_budget_days"'))
            return {
              rows: [
                ['slot', scenario === 'released' ? 'succeeded' : 'running', 1],
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
        purpose: 'bluesky-social-editor-v1',
        topicId: 'world',
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
    if (scenario === 'rollback') {
      assert.equal(lines.length, 0);
      continue;
    }
    const ledgerEntry = JSON.parse(lines[0]);
    assert.equal(ledgerEntry.event, 'budget.ledger-decision');
    assert.equal(ledgerEntry.purpose, 'bluesky-social-editor-v1');
    assert.equal(ledgerEntry.topicId, 'world');
    assert.deepEqual(
      ledgerEntry.refusalReasons,
      scenario === 'blocked'
        ? ['provider-blocked', 'scheduled-reserve']
        : scenario === 'manual'
          ? ['scheduled-reserve']
          : [],
    );
    if (scenario === 'disabled') {
      assert.equal(lines.length, 1);
      continue;
    }
    assert.equal(lines.length, 2);
    assert.ok(!lines.join('').includes('private'));
    const entry = JSON.parse(lines[1]);
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

void test('ledger decisions distinguish model, shared and verification limits', async () => {
  for (const scenario of [
    'model',
    'daily',
    'monthly',
    'verification',
    'admitted',
  ] as const) {
    const lines: string[] = [];
    const db = {
      connect: async () => ({
        release() {},
        async query(query: string | { text: string }) {
          const sql = typeof query === 'string' ? query : query.text;
          if (sql.includes('clock_timestamp()'))
            return { rows: [[new Date('2026-11-03T06:00:00Z')]] };
          if (sql.includes('sum(case when'))
            return {
              rows: [
                [
                  scenario === 'monthly'
                    ? 30e6
                    : scenario === 'daily'
                      ? 90000
                      : 0,
                  scenario === 'daily' ? 90000 : 0,
                ],
              ],
            };
          if (sql.includes('coalesce(sum('))
            return {
              rows: [
                [
                  scenario === 'model' || scenario === 'verification'
                    ? 40000
                    : 0,
                ],
              ],
            };
          return { rows: [], rowCount: 1 };
        },
      }),
    } as unknown as Pool;
    const model = llmConfig({}).sonnet;
    const ledger = new PostgresLlmLedger(
      db,
      {
        monthly: 30e6,
        dailyMax: 100000,
        modelAllocation: { model: model.id, dailyFraction: 0.5 },
      },
      scenario === 'verification',
      undefined,
      createLogger('test', { write: (line) => lines.push(line) }, []),
    );
    const result = await ledger.reserve(
      {
        model,
        purpose: 'bluesky-social-editor-v1',
        topicId: 'world',
        runId: 'edition',
        instructions: 'private instructions',
        prompt: 'private prompt',
        maxOutputTokens: 1,
      },
      30000,
    );
    assert.equal(result !== null, scenario === 'admitted');
    assert.equal(lines.length, 1);
    assert.ok(!lines[0].includes('private'));
    const entry = JSON.parse(lines[0]);
    assert.deepEqual(
      entry.refusalReasons,
      {
        model: ['model-allocation'],
        daily: ['daily-cap'],
        monthly: ['monthly-cap', 'daily-cap', 'model-allocation'],
        verification: ['verification-cap'],
        admitted: [],
      }[scenario],
    );
    assert.equal(
      entry.outcome,
      scenario === 'admitted' ? 'admitted' : 'refused',
    );
    if (scenario === 'model') {
      assert.equal(entry.modelUsedMicros, 40000);
      assert.equal(entry.modelAvailableMicros, 10000);
      assert.equal(entry.sharedAvailableMicros, 100000);
    }
    if (scenario === 'verification')
      assert.equal(entry.purpose, 'verification');
  }
});

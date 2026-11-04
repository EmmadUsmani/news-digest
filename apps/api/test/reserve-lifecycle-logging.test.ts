import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { Pool } from 'pg';

import { createLogger } from '../src/libs/observability/logging';
import { PostgresScheduledBudgetRepository } from '../src/modules/curation/database/scheduled-budget.repository';

void test('reserve lifecycle logs only committed observations and fenced transitions', async () => {
  for (const scenario of ['applied', 'stale', 'rollback'] as const) {
    const lines: string[] = [];
    let committed = false;
    const day = {
      budgetDay: '2026-11-03',
      scheduledAt: '2026-11-03T15:00:00Z',
      runId: 'slot',
      state: 'running',
      attempt: 2,
      outcome: null,
    };
    const db = {
      connect: async () => ({
        release() {},
        async query(query: string | { text: string; rowMode?: string }) {
          const sql = typeof query === 'string' ? query : query.text;
          const arrays = typeof query !== 'string' && query.rowMode === 'array';
          if (sql.includes('"snapshot"'))
            return {
              rows:
                scenario === 'stale'
                  ? []
                  : arrays
                    ? [[{ id: 'edition', topics: [] }]]
                    : [{ snapshot: { id: 'edition', topics: [] } }],
            };
          if (sql.toUpperCase() === 'BEGIN') committed = false;
          if (sql.toUpperCase() === 'COMMIT') {
            if (scenario === 'rollback')
              throw new Error('private database error');
            committed = true;
          }
          return {
            rows:
              scenario === 'stale' ? [] : [arrays ? Object.values(day) : day],
            rowCount: scenario === 'stale' ? 0 : 1,
          };
        },
      }),
    } as unknown as Pool;
    const repo = new PostgresScheduledBudgetRepository(
      db,
      createLogger(
        'test',
        {
          write(line) {
            assert.ok(committed);
            lines.push(line);
          },
        },
        [],
      ),
    );
    const actions = [
      () => repo.register(new Date('2026-11-03T15:00:00Z'), 'slot'),
      () =>
        repo.reconcilePending(
          '2026-11-03',
          'old',
          new Date('2026-11-03T15:00:00Z'),
          'slot',
        ),
      () => repo.removePending('2026-11-03', 'slot'),
      () => repo.missPending('2026-11-03', 'slot'),
      () => repo.claim('slot', 1),
      () => repo.finishAttempt('slot', 2, 'retrying'),
      () => repo.finishAttempt('slot', 2, 'failed'),
      () =>
        repo.finishAttempt('slot', 2, 'succeeded', {
          editionId: 'edition',
          mode: 'fallback',
          reason: 'private reason',
        }),
      () => repo.reconcilePublished('2026-11-03', 'slot', 2),
    ];
    for (const action of actions) {
      if (scenario === 'rollback') await assert.rejects(action);
      else await action();
    }
    if (scenario === 'rollback') {
      assert.equal(lines.length, 0);
      continue;
    }
    assert.equal(lines.length, actions.length);
    const entries = lines.map((line) => JSON.parse(line));
    assert.equal(entries[0].outcome, 'observed');
    for (const entry of entries.slice(1)) {
      assert.equal(entry.event, 'budget.reserve-lifecycle');
      assert.equal(
        entry.outcome,
        scenario === 'stale' ? 'unchanged' : 'applied',
      );
    }
    assert.equal(entries.at(-1).requestedState, 'succeeded');
    assert.ok(!lines.join('').includes('private'));
  }
});

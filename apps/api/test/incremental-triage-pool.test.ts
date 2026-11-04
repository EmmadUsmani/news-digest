import assert from 'node:assert/strict';
import test from 'node:test';

import type { PoolClient } from 'pg';

import { loadIncrementalTriagePool } from '../src/modules/digests/public/incremental-triage-pool';

void test('background pool preserves edition guidance, semantic recovery and exact window', async () => {
  const start = new Date('2026-11-03T15:00:00Z');
  const end = new Date('2026-11-04T15:00:00Z');
  const calls: unknown[] = [];
  let enabled = true;
  const db = {
    query: async (_sql: string, values: unknown[]) => {
      calls.push(values);
      return {
        rows:
          values.length === 1
            ? enabled
              ? [
                  {
                    id: 'nba',
                    name: 'NBA',
                    description: 'Basketball',
                    include_guidance: 'Include playoffs',
                    exclude_guidance: 'Skip rumors',
                    relevance_policy: {
                      includeAny: ['NBA'],
                      excludeAny: ['rumor'],
                    },
                  },
                ]
              : []
            : [
                'Team wins championship',
                'NBA rumor spreads',
                'NBA best bets',
              ].map((title, i) => ({
                id: String(i),
                title,
                excerpt: '',
                sources: ['Fixture'],
                publishedAt: start,
                points: null,
                url: `https://example.com/${i}`,
              })),
      };
    },
  } as unknown as Pick<PoolClient, 'query'>;
  const pool = await loadIncrementalTriagePool(db, 'nba', start, end);
  assert.deepEqual(
    pool?.candidates.map((c) => c.id),
    ['0'],
  );
  assert.deepEqual(pool?.topic, {
    id: 'nba',
    name: 'NBA',
    description: 'Basketball',
    guidance:
      'Include playoffs\nExclude: Skip rumors\nRequired phrases: NBA\nExcluded phrases: rumor',
  });
  assert.deepEqual(calls, [['nba'], ['nba', start, end]]);
  enabled = false;
  assert.equal(await loadIncrementalTriagePool(db, 'nba', start, end), null);
  assert.equal(calls.length, 3);
  for (const [id, from, to] of [
    ['', start, end],
    ['nba', end, start],
    ['nba', new Date(NaN), end],
  ] as const)
    await assert.rejects(loadIncrementalTriagePool(db, id, from, to));
  assert.equal(calls.length, 3);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  poolAdmission,
  poolOptions,
} from '../../../scripts/capture-triage-pool';
import type { Candidate } from '../src/modules/digests/domain/rank';

void test('pool capture accepts prospective edition ends but rejects invalid windows', () => {
  const now = Date.parse('2026-11-04T01:00Z');
  assert.equal(
    poolOptions(
      ['2026-11-03T15:00Z', '2026-11-04T15:00Z', '/tmp/pool'],
      now,
    ).end.toISOString(),
    '2026-11-04T15:00:00.000Z',
  );
  for (const args of [
    [],
    ['bad', '2026-11-04', '/tmp/a'],
    ['2026-11-05', '2026-11-06', '/tmp/a'],
    ['2026-11-01', '2026-11-04', '/tmp/a'],
    ['2026-11-04', '2026-11-03', '/tmp/a'],
  ])
    assert.throws(() => poolOptions(args, now), /started window/);
});

void test('pool evidence preserves semantic recovery and excludes only hard rules or disabled stories', () => {
  const candidate = {
    id: 'one',
    title: 'New research result',
    excerpt: '',
    url: 'https://example.com/a',
    publishedAt: '2026-11-04T00:00Z',
    sources: ['Example'],
    points: 0,
  } satisfies Candidate;
  const policy = { includeAny: ['basketball'], excludeAny: ['promotion'] };
  const rows = poolAdmission(
    [
      candidate,
      { ...candidate, id: 'two', title: 'Promotion today' },
      { ...candidate, id: 'three', title: 'How to watch tonight' },
    ],
    policy,
    5,
  );
  assert.deepEqual(
    rows.map((r) => r.triageEligible),
    [true, false, false],
  );
  assert.equal(rows[0].id, candidate.id);
  assert.equal(poolAdmission([candidate], policy, 0)[0].triageEligible, false);
});

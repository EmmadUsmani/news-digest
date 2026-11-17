import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { StoryGroupingResult } from '../src/modules/curation/public/editorial';
import { prepareStoryGrouping } from '../src/modules/digests/application/prepare-story-grouping';
import { type Candidate, rank } from '../src/modules/digests/domain/rank';

const pool: Candidate[] = ['a', 'b', 'c'].map((id) => ({
  id,
  title: 'Reported launch',
  url: `https://example.com/${id}`,
  excerpt: 'Recorded facts.',
  sources: [id],
  points: 0,
  publishedAt: '2026-11-01T12:00:00Z',
}));

void test('preparation preserves explicit validated empty membership and maps the bounded pool once', async () => {
  let calls = 0;
  const prepared = await prepareStoryGrouping(
    {
      async groupWithResult(topic, items, run) {
        calls++;
        assert.equal(topic, 'tech');
        assert.equal(run, 'run');
        assert.deepEqual(
          items.map((item) => [
            item.id,
            item.topicId,
            item.outlet,
            item.excerpt,
          ]),
          pool.map((item) => [item.id, 'tech', item.sources[0], item.excerpt]),
        );
        return { status: 'validated', groups: [] };
      },
    },
    'tech',
    pool,
    'run',
  );
  assert.equal(calls, 1);
  assert.equal(prepared.status, 'validated');
  assert.equal(prepared.matches(pool[0], pool[1]), false);
});

void test('prepared membership preserves original rank, representative and coverage', async () => {
  const prepared = await prepareStoryGrouping(
    {
      async groupWithResult() {
        return { status: 'validated', groups: [['a', 'b']] };
      },
    },
    'tech',
    pool,
    'run',
  );
  assert.equal(prepared.status, 'validated');
  assert.equal(prepared.matches(pool[0], pool[0]), false);
  assert.equal(prepared.matches(pool[1], pool[0]), true);
  assert.equal(prepared.matches(pool[0], pool[2]), false);
  const start = new Date('2026-11-01');
  const end = new Date('2026-11-02');
  assert.deepEqual(
    rank(pool, start, end, 10, prepared.matches),
    rank(
      pool,
      start,
      end,
      10,
      (a, b) => a.id !== b.id && a.id !== 'c' && b.id !== 'c',
    ),
  );
});

void test('failed and invalid membership never authorizes reservations', async () => {
  const results: StoryGroupingResult[] = [
    { status: 'unavailable', reason: 'no-result' },
    ...[
      [['a']],
      [['a', 'unknown']],
      [['a', 'a']],
      [
        ['a', 'b'],
        ['b', 'c'],
      ],
    ].map((groups) => ({ status: 'validated' as const, groups })),
  ];
  for (const result of results) {
    const prepared = await prepareStoryGrouping(
      {
        async groupWithResult() {
          return result;
        },
      },
      'tech',
      pool,
      'run',
    );
    assert.equal(prepared.status, 'unavailable');
    assert.equal(prepared.matches(pool[0], pool[1]), false);
  }
  const failed = await prepareStoryGrouping(
    {
      async groupWithResult() {
        throw new Error('provider');
      },
    },
    'tech',
    pool,
    'run',
  );
  assert.equal(failed.status, 'unavailable');
});

void test('disabled, small, oversized and ambiguous pools do not call grouping', async () => {
  const port = {
    async groupWithResult(): Promise<StoryGroupingResult> {
      assert.fail('must not call provider');
    },
  };
  for (const items of [
    [],
    [pool[0]],
    [pool[0], pool[0]],
    [{ ...pool[0], id: '' }, pool[1]],
    Array.from({ length: 41 }, (_, i) => ({ ...pool[0], id: String(i) })),
  ]) {
    assert.equal(
      (await prepareStoryGrouping(port, 'tech', items, 'run')).status,
      'unavailable',
    );
  }
  assert.equal(
    (await prepareStoryGrouping(null, 'tech', pool, 'run')).status,
    'unavailable',
  );
});

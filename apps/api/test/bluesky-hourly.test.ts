import assert from 'node:assert/strict';
import { test } from 'node:test';

import { collectBlueskyTopics } from '../src/modules/social/application/collect-bluesky-topics';
import type { BlueskyRepository } from '../src/modules/social/domain/bluesky';

const now = () => new Date('2026-11-03T16:00:00Z');
const topic = (id: string, changes = {}) => ({
  id,
  name: 'World news',
  enabled: true,
  postBudget: 5,
  queries: [],
  relevancePolicy: { includeAny: [], excludeAny: [] },
  ...changes,
});
const repository: BlueskyRepository = {
  async store() {},
  async observations() {
    return [];
  },
};

void test('hourly discovery respects topic configuration, caps volume and shares the exact 24h window', async () => {
  const calls: string[] = [];
  const result = await collectBlueskyTopics(
    repository,
    {
      async search(query, start, end) {
        calls.push(query);
        assert.equal(start.toISOString(), '2026-11-02T16:00:00.000Z');
        assert.equal(end.toISOString(), now().toISOString());
        return [];
      },
    },
    [
      topic('disabled', { enabled: false }),
      topic('zero', { postBudget: 0 }),
      topic('custom', { queries: [' ', 'custom query'] }),
      topic('policy', {
        relevancePolicy: { includeAny: ['NBA'], excludeAny: [] },
      }),
      topic('fallback'),
      topic('fourth'),
      topic('capped'),
    ],
    now,
  );
  assert.deepEqual(calls, ['custom query', 'NBA', 'World news', 'World news']);
  assert.deepEqual(
    result.topics.map((t) => t.topicId),
    ['custom', 'policy', 'fallback', 'fourth'],
  );
  assert.ok(result.topics.every((t) => t.submitted === 0));
});

void test('hourly collection stops the whole pass on search or storage failure without retries', async () => {
  for (const failing of ['search', 'store']) {
    let requests = 0;
    await assert.rejects(
      collectBlueskyTopics(
        {
          ...repository,
          async store() {
            if (failing === 'store') throw new Error('storage');
          },
        },
        {
          async search() {
            requests++;
            if (failing === 'search') throw new Error('rate limit');
            return [];
          },
        },
        [topic('first'), topic('second')],
        now,
      ),
    );
    assert.equal(requests, 1);
  }
});

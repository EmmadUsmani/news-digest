import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { EventGrouping } from '../src/modules/curation/application/event-grouping';

const scopes = [
  {
    id: 'world',
    name: 'World',
    description: 'International affairs, including US foreign policy',
    guidance: 'Exclude primarily domestic events',
  },
  {
    id: 'us',
    name: 'U.S.',
    description: 'Primarily US domestic events',
    guidance: 'Exclude international affairs',
  },
];
const candidates = [
  {
    id: 'a',
    topicId: 'world',
    title: 'Congress votes on domestic policy',
    outlet: 'One',
    publishedAt: '2026-11-11',
    excerpt: null,
  },
  {
    id: 'b',
    topicId: 'us',
    title: 'Reaction to congressional domestic vote',
    outlet: 'Two',
    publishedAt: '2026-11-11',
    excerpt: null,
  },
  {
    id: 'c',
    topicId: 'us',
    title: 'US negotiates international ceasefire',
    outlet: 'Three',
    publishedAt: '2026-11-11',
    excerpt: null,
  },
];
function harness(response: unknown, available = true) {
  let calls = 0;
  const cache = new Map<string, unknown>();
  const llm = new BudgetedLlm(
    {
      async complete(request) {
        calls++;
        assert.equal(request.purpose, 'joint-story-grouping-v1');
        assert.equal(request.maxOutputTokens, 4096);
        const input = JSON.parse(request.prompt);
        assert.deepEqual(
          input.scopes.map((scope: { id: string }) => scope.id),
          ['world', 'us'],
        );
        return {
          text: JSON.stringify(response),
          usage: { input: 10, output: 10, cacheWrite: 0, cacheRead: 0 },
        };
      },
    },
    {
      async cached(key) {
        return cache.get(key);
      },
      async cache(key, value) {
        cache.set(key, value);
      },
      async reserve() {
        return available ? 'hold' : null;
      },
      async settle() {},
      async fail() {},
    },
  );
  return {
    service: new EventGrouping(llm, llmConfig({}).haiku),
    calls: () => calls,
  };
}
const groups = [
  { topicId: 'us', ids: ['a', 'b'] },
  { topicId: 'world', ids: ['c'] },
];
void test('joint ownership merges cross-source events, reassigns singletons and caches the complete partition', async () => {
  const h = harness({ groups });
  assert.deepEqual(
    await h.service.assignTopics(scopes, candidates, 'one'),
    groups,
  );
  assert.deepEqual(
    await h.service.assignTopics(scopes, candidates, 'two'),
    groups,
  );
  assert.equal(h.calls(), 1);
  await h.service.assignTopics(
    scopes.map((s) => ({ ...s, guidance: s.guidance + ' updated' })),
    candidates,
    'three',
  );
  assert.equal(h.calls(), 2);
});
for (const response of [
  { groups: [] },
  { groups: [{ topicId: 'us', ids: ['a', 'b'] }] },
  { groups: [...groups, { topicId: 'world', ids: ['a'] }] },
  { groups: [{ topicId: 'tech', ids: ['a', 'b', 'c'] }] },
  { groups: [{ topicId: 'us', ids: ['a', 'b', 'c', 'unknown'] }] },
  { groups, extra: true },
]) {
  void test(`invalid ownership is unavailable without repairs: ${JSON.stringify(response)}`, async () => {
    const h = harness(response);
    assert.equal(await h.service.assignTopics(scopes, candidates, 'run'), null);
    assert.equal(h.calls(), 1);
  });
}
void test('budget refusal and invalid inputs never produce a successful partition', async () => {
  const denied = harness({ groups }, false);
  assert.equal(
    await denied.service.assignTopics(scopes, candidates, 'run'),
    null,
  );
  assert.equal(denied.calls(), 0);
  const h = harness({ groups });
  for (const items of [
    [candidates[0], candidates[0]],
    [{ ...candidates[0], topicId: 'tech' }],
    Array.from({ length: 41 }, (_, i) => ({ ...candidates[0], id: String(i) })),
  ]) {
    assert.equal(await h.service.assignTopics(scopes, items, 'run'), null);
  }
  assert.equal(
    await h.service.assignTopics([scopes[0], scopes[0]], candidates, 'run'),
    null,
  );
  assert.deepEqual(await h.service.assignTopics(scopes, [], 'run'), []);
  assert.equal(h.calls(), 0);
});

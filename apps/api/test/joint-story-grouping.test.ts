import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { EventGrouping } from '../src/modules/curation/application/event-grouping';
import type { RejectedEditorRecord } from '../src/modules/curation/domain/rejected-editor.port';

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
        assert.equal(request.purpose, 'joint-story-grouping-v2');
        assert.equal(request.maxOutputTokens, 4096);
        const input = JSON.parse(request.prompt);
        assert.deepEqual(
          input.scopes.map((scope: { id: string }) => scope.id),
          ['t0', 't1'],
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
const wireGroups = [
  { topicId: 't1', ids: ['a0', 'a1'] },
  { topicId: 't0', ids: ['a2'] },
];
void test('truncated ownership settles once, preserves rejection evidence and allows a later complete partition', async () => {
  // Synthetic raw transport response, modelling the observed output truncation.
  const truncated = '{"groups":[{"topicId":"t1","ids":["a0","a1"]},';
  const cache = new Map<string, unknown>();
  const rejections: RejectedEditorRecord[] = [];
  const settled: string[] = [];
  let calls = 0;
  let reservations = 0;
  const llm = new BudgetedLlm(
    {
      async complete(request) {
        calls++;
        assert.equal(request.maxOutputTokens, 4096);
        return {
          text:
            calls === 1 ? truncated : JSON.stringify({ groups: wireGroups }),
          usage: { input: 100, output: 4096, cacheWrite: 0, cacheRead: 0 },
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
        return `hold-${++reservations}`;
      },
      async settle(id, usage, cost) {
        assert.equal(usage.output, 4096);
        assert.ok(cost > 0);
        settled.push(id);
      },
      async fail() {
        assert.fail('A received invalid response still incurs usage');
      },
    },
    undefined,
    {
      async save(record) {
        rejections.push(record);
      },
    },
  );
  const service = new EventGrouping(llm, llmConfig({}).haiku);
  assert.equal(
    await service.assignTopics(scopes, candidates, 'truncated'),
    null,
  );
  assert.equal(calls, 1); // Ownership has no repair dispatch.
  assert.equal(reservations, 1);
  assert.deepEqual(settled, ['hold-1']);
  assert.equal(cache.size, 0);
  assert.equal(rejections.length, 1);
  assert.equal(rejections[0].responseText, truncated);
  assert.equal(rejections[0].diagnostic.category, 'invalid-json');
  assert.equal(rejections[0].request.runId, 'truncated');
  assert.deepEqual(
    await service.assignTopics(scopes, candidates, 'recovered'),
    groups,
  );
  assert.deepEqual(settled, ['hold-1', 'hold-2']);
  assert.equal(cache.size, 1);
  assert.deepEqual(
    await service.assignTopics(scopes, candidates, 'cached'),
    groups,
  );
  assert.equal(calls, 2);
  assert.equal(reservations, 2);
  assert.equal(rejections.length, 1);
});
void test('joint ownership merges cross-source events, reassigns singletons and caches the complete partition', async () => {
  const h = harness({ groups: wireGroups });
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
  { groups: [{ topicId: 't1', ids: ['a0', 'a1'] }] },
  { groups: [...wireGroups, { topicId: 't0', ids: ['a0'] }] },
  { groups: [{ topicId: 'tech', ids: ['a0', 'a1', 'a2'] }] },
  { groups: [{ topicId: 't1', ids: ['a0', 'a1', 'a2', 'unknown'] }] },
  { groups: [{ topicId: 't1', ids: ['a0', 'a0', 'a2'] }] },
  { groups: wireGroups, extra: true },
  { groups }, // Stored identifiers are not valid wire aliases.
]) {
  void test(`invalid ownership is unavailable without repairs: ${JSON.stringify(response)}`, async () => {
    const h = harness(response);
    assert.equal(await h.service.assignTopics(scopes, candidates, 'run'), null);
    assert.equal(h.calls(), 1);
  });
}
void test('budget refusal and invalid inputs never produce a successful partition', async () => {
  const denied = harness({ groups: wireGroups }, false);
  assert.equal(
    await denied.service.assignTopics(scopes, candidates, 'run'),
    null,
  );
  assert.equal(denied.calls(), 0);
  const h = harness({ groups: wireGroups });
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

void test('forty long identifiers round-trip through a bounded singleton response and aliased citations', async () => {
  const longScopes = scopes.map((scope, i) => ({
    ...scope,
    id: `${i}-${'t'.repeat(198)}`,
  }));
  const items = Array.from({ length: 40 }, (_, i) => ({
    ...candidates[i % 3],
    id: `${String(i).padStart(2, '0')}-${'a'.repeat(197)}`,
    topicId: longScopes[i % 2].id,
    outboundLinks: ['https://example.com/report'],
  }));
  const wire = {
    groups: items.map((_, i) => ({
      topicId: `t${1 - (i % 2)}`,
      ids: [`a${i}`],
    })),
  };
  assert.ok(Buffer.byteLength(JSON.stringify(wire)) < 1500);
  const service = new EventGrouping(
    {
      async json(request, parse, options) {
        assert.equal(request.maxOutputTokens, 4096);
        assert.deepEqual(options, { repair: false });
        const input = JSON.parse(request.prompt);
        assert.deepEqual(
          input.sharedReferences[0].ids,
          items.map((_, i) => `a${i}`),
        );
        assert.deepEqual(
          input.candidates.map((item: { id: string; topicId: string }) => [
            item.id,
            item.topicId,
          ]),
          items.map((_, i) => [`a${i}`, `t${i % 2}`]),
        );
        assert.ok(!request.prompt.includes(items[0].id));
        return parse(wire);
      },
    },
    llmConfig({}).haiku,
  );
  const before = structuredClone(items);
  assert.deepEqual(
    await service.assignTopics(longScopes, items, 'long'),
    items.map((item, i) => ({
      topicId: longScopes[1 - (i % 2)].id,
      ids: [item.id],
    })),
  );
  assert.deepEqual(items, before);
});

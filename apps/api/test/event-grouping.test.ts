import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import {
  EventGrouping,
  type GroupingCandidate,
} from '../src/modules/curation/application/event-grouping';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';

const candidates: GroupingCandidate[] = ['a', 'b', 'c'].map((id) => ({
  id,
  topicId: 'nba',
  title: id,
  outlet: 'Outlet',
  publishedAt: '2026-11-03T12:00:00Z',
  excerpt: null,
}));
function harness(text: string, available = true) {
  const values = new Map<string, unknown>();
  let calls = 0,
    settlements = 0,
    reservations = 0;
  const ledger: LlmLedger = {
    async cached(key) {
      return values.get(key);
    },
    async cache(key, value) {
      values.set(key, value);
    },
    async reserve() {
      reservations++;
      return available ? 'hold' : null;
    },
    async settle() {
      settlements++;
    },
    async fail() {},
  };
  const budget = new BudgetedLlm(
    {
      async complete(request) {
        calls++;
        assert.equal(request.purpose, 'story-grouping-v3');
        return {
          text,
          usage: { input: 10, output: 10, cacheWrite: 0, cacheRead: 0 },
        };
      },
    },
    ledger,
  );
  return {
    service: new EventGrouping(budget, llmConfig({}).haiku),
    counts: () => ({ calls, settlements, reservations }),
    values,
  };
}
void test('grouping uses budgeted cached membership, leaving omitted articles separate', async () => {
  const h = harness('{"groups":[["a","b"]]}');
  assert.deepEqual(await h.service.group('nba', candidates, 'run'), [
    ['a', 'b'],
  ]);
  assert.deepEqual(await h.service.group('nba', candidates, 'other-run'), [
    ['a', 'b'],
  ]);
  assert.deepEqual(h.counts(), { calls: 1, settlements: 1, reservations: 1 });
  assert.deepEqual(
    await h.service.group(
      'nba',
      candidates.map((c) => ({ ...c, title: c.title + 'changed' })),
      'run',
    ),
    [['a', 'b']],
  );
  assert.equal(h.counts().calls, 2);
});
for (const text of [
  'not json',
  '{"groups":[["a","unknown"]]}',
  '{"groups":[["a","b"],["b","c"]]}',
  '{"groups":[["a","a"]]}',
  '{"groups":[["a"]]}',
  '{"groups":[],"extra":true}',
]) {
  void test(`invalid membership skips grouping with no repair: ${text}`, async () => {
    const h = harness(text);
    assert.deepEqual(await h.service.group('nba', candidates, 'run'), []);
    assert.equal(h.counts().calls, 1);
    assert.equal(h.counts().settlements, 1);
    assert.equal(h.values.size, 0);
  });
}
void test('mixed topics, duplicate input IDs and oversized shortlists never spend', async () => {
  const h = harness('{"groups":[]}');
  for (const items of [
    [{ ...candidates[0], topicId: 'tech' }, candidates[1]],
    [candidates[0], candidates[0]],
    Array.from({ length: 41 }, (_, i) => ({
      ...candidates[0],
      id: String(i),
    })),
    [],
  ]) {
    assert.deepEqual(await h.service.group('nba', items, 'run'), []);
  }
  assert.equal(h.counts().reservations, 0);
});
void test('budget refusal and unavailable provider keep articles separate', async () => {
  const h = harness('{"groups":[]}', false);
  assert.deepEqual(await h.service.group('nba', candidates, 'run'), []);
  assert.equal(h.counts().calls, 0);
  const service = new EventGrouping(
    {
      async json() {
        throw new Error('unavailable');
      },
    },
    llmConfig({}).haiku,
  );
  assert.deepEqual(await service.group('nba', candidates, 'run'), []);
});

void test('shared references normalize X IDs, dedupe citations and never force merges', async () => {
  const prompts: string[] = [];
  const service = new EventGrouping(
    {
      async json(request, validate) {
        prompts.push(request.prompt);
        assert.match(request.instructions, /hints only, never proof/);
        return validate({ groups: [] });
      },
    },
    llmConfig({}).haiku,
  );
  const items = candidates.map((item, i) => ({
    ...item,
    outboundLinks:
      i === 0
        ? [
            'https://twitter.com/reporter/status/123?s=20',
            'https://x.com/reporter/status/123',
            'https://example.com/story#section',
            'javascript:alert(1)',
            'https://user:password@example.com/story',
            'https://x.com.evil.test/reporter/status/123',
          ]
        : i === 1
          ? [
              'https://x.com/other/status/123/photo/1',
              'https://example.com/story',
              'https://example.com/different',
            ]
          : ['https://example.com/unrelated'],
  }));
  assert.deepEqual(await service.group('nba', items, 'run'), []);
  assert.deepEqual(JSON.parse(prompts[0]).sharedReferences, [
    { url: 'https://x.com/i/status/123', ids: ['a', 'b'] },
    { url: 'https://example.com/story', ids: ['a', 'b'] },
  ]);
});
void test('changed shared hints invalidate cached grouping without extra repair calls', async () => {
  const h = harness('{"groups":[]}');
  await h.service.group('nba', candidates, 'run');
  const items = candidates.map((item) => ({
    ...item,
    outboundLinks: ['https://example.com/event'],
  }));
  await h.service.group('nba', items, 'run');
  await h.service.group('nba', items, 'another-run');
  assert.equal(h.counts().calls, 2);
});
void test('reference hints bound link counts and URL length without truncating into matches', async () => {
  const service = new EventGrouping(
    {
      async json(request, validate) {
        assert.deepEqual(JSON.parse(request.prompt).sharedReferences, []);
        return validate({ groups: [] });
      },
    },
    llmConfig({}).haiku,
  );
  const long = 'https://example.com/' + 'a'.repeat(2048);
  const items = candidates.map((item, i) => ({
    ...item,
    outboundLinks:
      i === 0
        ? [
            ...Array.from({ length: 20 }, (_, j) => `https://example.com/${j}`),
            'https://example.com/shared',
            long,
          ]
        : ['https://example.com/shared', long, 'invalid URL'],
  }));
  assert.deepEqual(await service.group('nba', items.slice(0, 2), 'run'), []);
});

void test('same-story instructions allow direct consequences but reject shared-theme merges', async () => {
  const service = new EventGrouping(
    {
      async json(request, validate) {
        assert.match(
          request.instructions,
          /SAME news story within the edition window/,
        );
        assert.match(
          request.instructions,
          /direct follow-ups, reactions and consequences/,
        );
        assert.match(
          request.instructions,
          /Clearly separate events that merely share people, teams, companies or a theme must stay apart/,
        );
        assert.match(
          request.instructions,
          /When uncertain keep articles separate/,
        );
        assert.equal(request.purpose, 'story-grouping-v3');
        return validate({ groups: [['a', 'b']] });
      },
    },
    llmConfig({}).haiku,
  );
  assert.deepEqual(await service.group('nba', candidates, 'run'), [['a', 'b']]);
});

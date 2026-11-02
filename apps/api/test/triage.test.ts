import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import {
  CandidateTriage,
  type TriageCandidate,
} from '../src/modules/curation/application/triage';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';

const topic = {
  id: 'tech',
  name: 'Tech',
  description: 'AI and software',
  guidance: 'Prioritize consequential launches',
};
const candidates: TriageCandidate[] = Array.from({ length: 7 }, (_, i) => ({
  id: String(i),
  title: 'Candidate ' + i,
  excerpt: 'Reported facts',
  sources: ['Publisher'],
}));
function harness(transform?: (items: ReturnType<typeof score>[]) => unknown) {
  const values = new Map<string, unknown>();
  const calls: LlmRequest[] = [];
  let available = true;
  const ledger: LlmLedger = {
    async cached(key) {
      return values.get(key);
    },
    async cache(key, value) {
      values.set(key, value);
    },
    async reserve() {
      return available ? 'reservation' : null;
    },
    async settle() {},
    async fail() {},
  };
  const llm = new BudgetedLlm(
    {
      async complete(request) {
        calls.push(request);
        const prompt = JSON.parse(request.prompt) as {
          candidates: TriageCandidate[];
        };
        const items = prompt.candidates.map(score);
        return {
          text: JSON.stringify(transform ? transform(items) : { items }),
          usage: { input: 20, output: 20, cacheRead: 0, cacheWrite: 0 },
        };
      },
    },
    ledger,
  );
  return {
    service: new CandidateTriage(llm, ledger, llmConfig({}).haiku),
    calls,
    values,
    refuse: () => {
      available = false;
    },
  };
}
function score(c: TriageCandidate) {
  return {
    id: c.id,
    relevance: 8,
    importance: 7,
    event: 'Model launch',
    rationale: 'Relevant reported launch',
  };
}
void test('triage covers all candidates in bounded batches before any lexical filter', async () => {
  const h = harness();
  const result = await h.service.score(topic, candidates, 'run');
  assert.deepEqual(
    result.scores.map((s) => s.id),
    candidates.map((c) => c.id),
  );
  assert.deepEqual(result.unscoredIds, []);
  assert.equal(h.calls.length, 3);
  assert.ok(
    h.calls.every(
      (r) =>
        r.model.id === 'claude-haiku-5-5' &&
        r.purpose === 'candidate-triage-v1',
    ),
  );
  await h.service.score(topic, candidates.slice().reverse(), 'new-run');
  assert.equal(
    h.calls.length,
    3,
    'Per-item cache survives different ordering and batch composition',
  );
});
void test('cache invalidates changed item text and topic guidance', async () => {
  const h = harness();
  await h.service.score(topic, candidates, 'first');
  await h.service.score(
    topic,
    [{ ...candidates[0], excerpt: 'Updated facts' }],
    'changed',
  );
  assert.equal(h.calls.length, 4);
  await h.service.score(
    { ...topic, guidance: 'New guidance' },
    [candidates[1]],
    'guidance',
  );
  assert.equal(h.calls.length, 5);
});
void test('duplicate, foreign, omitted and out-of-range outputs never become item cache entries', async () => {
  for (const transform of [
    (items: ReturnType<typeof score>[]) => ({
      items: items.map(() => items[0]),
    }),
    (items: ReturnType<typeof score>[]) => ({
      items: items.map((s) => ({ ...s, id: 'foreign' })),
    }),
    (items: ReturnType<typeof score>[]) => ({ items: items.slice(1) }),
    (items: ReturnType<typeof score>[]) => ({
      items: items.map((s) => ({ ...s, relevance: 11 })),
    }),
  ]) {
    const h = harness(transform);
    const result = await h.service.score(topic, candidates, 'invalid');
    assert.deepEqual(result.scores, []);
    assert.deepEqual(
      result.unscoredIds,
      candidates.map((c) => c.id),
    );
    assert.equal(
      h.calls.length,
      2,
      'Exactly one transport repair; stop before later batches',
    );
    assert.equal(h.values.size, 0);
  }
});
void test('budget exhaustion preserves cached items and explicitly reports remaining IDs', async () => {
  const h = harness();
  await h.service.score(topic, candidates.slice(0, 2), 'cached');
  h.refuse();
  const result = await h.service.score(topic, candidates, 'exhausted');
  assert.equal(result.scores.length, 2);
  assert.deepEqual(
    result.unscoredIds,
    candidates.slice(2).map((c) => c.id),
  );
  assert.equal(h.calls.length, 1);
});
void test('worst-case escaped text stays below prompt limit; empty and invalid sets do not call', async () => {
  const h = harness();
  await h.service.score(
    {
      ...topic,
      name: '\u0000'.repeat(500),
      description: '\u0000'.repeat(5000),
      guidance: '\u0000'.repeat(5000),
    },
    candidates.slice(0, 3).map((c) => ({
      ...c,
      title: '\u0000'.repeat(600),
      excerpt: '\u0000'.repeat(5000),
      sources: Array(20).fill('\u0000'.repeat(500)) as string[],
    })),
    'bound',
  );
  assert.ok(
    Buffer.byteLength(h.calls[0].instructions + h.calls[0].prompt) + 2048 <
      100000,
  );
  assert.deepEqual(await h.service.score(topic, [], 'empty'), {
    scores: [],
    unscoredIds: [],
  });
  await assert.rejects(() =>
    h.service.score(topic, [candidates[0], candidates[0]], 'duplicate'),
  );
  await assert.rejects(() =>
    h.service.score(
      topic,
      Array(201).fill(candidates[0]) as TriageCandidate[],
      'oversize',
    ),
  );
  assert.equal(h.calls.length, 1);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { ShortlistEditor } from '../src/modules/curation/application/editor';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';

const topic = {
  id: 'tech',
  name: 'Tech',
  description: 'AI news',
  guidance: 'No filler',
};
const candidates = [
  {
    id: 'one',
    title: 'A launch',
    excerpt: 'A company announced a model.',
    sources: ['Publisher'],
  },
];
const story = {
  id: 'one',
  evidenceIds: ['one'],
  headline: 'Company announces model',
  summary: 'The company announced a model. Details remain limited.',
  whyItMatters: 'Builders have a new option.',
  rationale: 'Relevant launch.',
};
const valid = {
  brief: ['A company announced a model.', 'Details remain limited.'],
  stories: [story],
};
function harness(outputs: unknown[] = [valid], refuse: string[] = []) {
  const config = llmConfig({});
  const calls: LlmRequest[] = [];
  const cache = new Map<string, unknown>();
  const ledger: LlmLedger = {
    async cached(key) {
      return cache.get(key);
    },
    async cache(key, value) {
      cache.set(key, value);
    },
    async reserve(request) {
      return refuse.includes(request.model.id) ? null : 'id';
    },
    async settle() {},
    async fail() {},
  };
  const llm = new BudgetedLlm(
    {
      async complete(request) {
        calls.push(request);
        return {
          text: JSON.stringify(
            outputs[Math.min(calls.length - 1, outputs.length - 1)],
          ),
          usage: { input: 1, output: 1, cacheWrite: 0, cacheRead: 0 },
        };
      },
    },
    ledger,
  );
  return {
    editor: new ShortlistEditor(llm, config.sonnet, config.haiku),
    calls,
  };
}
void test('editor selects supplied IDs, records model and reuses cache across runs', async () => {
  const h = harness();
  const result = await h.editor.edit(topic, candidates, 1, 'first');
  assert.deepEqual(result, { ...valid, model: 'claude-sonnet-5-5' });
  assert.deepEqual(await h.editor.edit(topic, candidates, 1, 'second'), result);
  assert.equal(h.calls.length, 1);
});
void test('Sonnet reservation refusal falls back to capped Haiku; total refusal returns no AI result', async () => {
  const h = harness([valid], ['claude-sonnet-5-5']);
  assert.equal(
    (await h.editor.edit(topic, candidates, 1, 'fallback'))?.model,
    'claude-haiku-5-5',
  );
  assert.equal(h.calls.length, 1);
  const exhausted = harness([valid], ['claude-sonnet-5-5', 'claude-haiku-5-5']);
  assert.equal(await exhausted.editor.edit(topic, candidates, 1, 'none'), null);
  assert.equal(exhausted.calls.length, 0);
});
void test('invalid selection gets one repair per model then returns no result', async () => {
  for (const output of [
    { ...valid, stories: [{ ...story, id: 'invented' }] },
    { ...valid, stories: [story, story] },
    ...[[], ['invented'], ['one', 'one']].map((evidenceIds) => ({
      ...valid,
      stories: [{ ...story, evidenceIds }],
    })),
    { ...valid, brief: [] },
    { brief: valid.brief, stories: [] },
    { ...valid, stories: [{ ...story, url: 'https://invented.example' }] },
  ]) {
    const h = harness([output]);
    assert.equal(await h.editor.edit(topic, candidates, 1, 'invalid'), null);
    assert.equal(h.calls.length, 4);
  }
});
void test('quiet windows and zero budgets do not pad or spend', async () => {
  const h = harness([{ brief: [], stories: [] }]);
  assert.deepEqual(
    (await h.editor.edit(topic, candidates, 1, 'quiet'))?.stories,
    [],
  );
  const before = h.calls.length;
  assert.equal(
    (await h.editor.edit(topic, candidates, 0, 'zero'))?.model,
    'none',
  );
  assert.equal((await h.editor.edit(topic, [], 5, 'empty'))?.model, 'none');
  assert.equal(h.calls.length, before);
  await assert.rejects(() =>
    h.editor.edit(topic, [...candidates, ...candidates], 1, 'duplicate'),
  );
  await assert.rejects(() => h.editor.edit(topic, candidates, 11, 'budget'));
});
void test('maximum escaped shortlist stays under transport input bound', async () => {
  const h = harness([{ brief: [], stories: [] }]);
  const text = '\u0000'.repeat(5000);
  await h.editor.edit(
    { id: text, name: text, description: text, guidance: text },
    Array.from({ length: 10 }, (_, i) => ({
      id: String(i),
      title: text,
      excerpt: text,
      sources: [text, text, text],
    })),
    10,
    'bound',
  );
  assert.ok(
    Buffer.byteLength(h.calls[0].instructions + h.calls[0].prompt) + 2048 <
      100000,
  );
  assert.equal(h.calls.length, 1);
});

void test('editor retains supporting IDs outside selected stories and requires the lead ID', async () => {
  const second = { ...candidates[0], id: 'two' };
  const supported = {
    ...valid,
    stories: [{ ...story, evidenceIds: ['one', 'two'] }],
  };
  const h = harness([supported]);
  assert.deepEqual(
    (await h.editor.edit(topic, [...candidates, second], 1, 'support'))
      ?.stories,
    supported.stories,
  );
  const invalid = harness([
    { ...valid, stories: [{ ...story, evidenceIds: ['two'] }] },
  ]);
  assert.equal(
    await invalid.editor.edit(
      topic,
      [...candidates, second],
      1,
      'missing-lead',
    ),
    null,
  );
});

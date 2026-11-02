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
  summary: 'The company announced a model.',
  whyItMatters: 'Builders have a new option.',
  rationale: 'Relevant launch.',
};
const valid = {
  brief: ['A company announced a model.', 'A model launch.'],
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
    diagnostics: () => llm.validationDiagnostics(),
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

void test('absence claims fail closed in every output field and repair can remove them', async () => {
  for (const field of [
    'headline',
    'summary',
    'whyItMatters',
    'rationale',
  ] as const) {
    const invalid = {
      ...valid,
      stories: [{ ...story, [field]: 'Apple has not confirmed the feature.' }],
    };
    const h = harness([invalid]);
    assert.equal(await h.editor.edit(topic, candidates, 1, 'absence'), null);
    assert.equal(h.calls.length, 4);
    const repaired = harness([invalid, valid]);
    assert.ok(await repaired.editor.edit(topic, candidates, 1, 'repair'));
    assert.equal(repaired.calls.length, 2);
    assert.ok(
      repaired.calls[1].prompt.includes('failed the absence-support check'),
    );
    assert.ok(
      repaired.calls[1].prompt.includes('Return the complete corrected JSON'),
    );
    assert.ok(!repaired.calls[1].prompt.includes('Apple has not confirmed'));
    // The original untrusted topic/shortlist is unchanged; feedback is fixed.
    assert.ok(repaired.calls[1].prompt.startsWith(repaired.calls[0].prompt));
    assert.equal(repaired.calls[1].model.id, repaired.calls[0].model.id);
  }
  const h = harness([
    { ...valid, brief: ['A launch.', 'No price is available.'] },
  ]);
  assert.equal(await h.editor.edit(topic, candidates, 1, 'brief'), null);
});

void test('absence support is limited to cited and actually supplied bounded input', async () => {
  const sentence = 'The company has not announced a price.';
  const output = { ...valid, stories: [{ ...story, summary: sentence }] };
  const supported = [{ ...candidates[0], excerpt: sentence }];
  assert.ok(
    await harness([output]).editor.edit(topic, supported, 1, 'supported'),
  );
  const other = { ...candidates[0], id: 'two', excerpt: sentence };
  assert.equal(
    await harness([output]).editor.edit(
      topic,
      [...candidates, other],
      1,
      'uncited',
    ),
    null,
  );
  const clipped = [{ ...candidates[0], excerpt: 'x'.repeat(601) + sentence }];
  assert.equal(
    await harness([output]).editor.edit(topic, clipped, 1, 'clipped'),
    null,
  );
  const changed = {
    ...valid,
    stories: [
      { ...story, summary: 'Another company has not announced a price.' },
    ],
  };
  assert.equal(
    await harness([changed]).editor.edit(topic, supported, 1, 'subject'),
    null,
  );
});

void test('editor exposes sanitized selection and absence failure categories through real validation', async () => {
  for (const [output, category] of [
    [
      { ...valid, stories: [{ ...story, evidenceIds: ['unknown'] }] },
      'invalid-selection',
    ],
    [
      {
        ...valid,
        stories: [
          { ...story, summary: 'The company has not confirmed the launch.' },
        ],
      },
      'unsupported-absence',
    ],
  ] as const) {
    const h = harness([output]);
    assert.equal(
      await h.editor.edit(topic, candidates, 1, 'diagnostics'),
      null,
    );
    assert.deepEqual(
      h.diagnostics().map((event) => event.category),
      Array(4).fill(category),
    );
  }
});

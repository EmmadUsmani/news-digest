import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { SocialPostEditor } from '../src/modules/curation/application/social-editor';
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
    text: 'A company announced a model.',
    author: 'Lab',
    publishedAt: '2026-11-02T00:00:00Z',
    relevance: 9,
    interestingness: 8,
  },
];
const post = {
  id: 'one',
  whyItMatters: 'A model announcement.',
  rationale: 'A relevant launch.',
};
const valid = { posts: [post] };
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
    editor: new SocialPostEditor(llm, config.sonnet, config.haiku),
    calls,
    diagnostics: () => llm.validationDiagnostics(),
  };
}
void test('social editor preserves post identity, isolates purpose and reuses cached selection', async () => {
  const h = harness();
  const result = await h.editor.edit(topic, candidates, 1, 'first');
  assert.deepEqual(result, { ...valid, model: 'claude-sonnet-5-5' });
  assert.deepEqual(await h.editor.edit(topic, candidates, 1, 'second'), result);
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].purpose, 'social-editor-v2');
  assert.match(h.calls[0].instructions, /Never infer virality/);
  assert.match(h.calls[0].instructions, /do not rewrite/);
  assert.deepEqual(candidates[0].text, 'A company announced a model.');
});
void test('social editor uses capped Haiku fallback and reports total refusal', async () => {
  const h = harness([valid], ['claude-sonnet-5-5']);
  assert.equal(
    (await h.editor.edit(topic, candidates, 1, 'run'))?.model,
    'claude-haiku-5-5',
  );
  const exhausted = harness([valid], ['claude-sonnet-5-5', 'claude-haiku-5-5']);
  assert.equal(await exhausted.editor.edit(topic, candidates, 1, 'run'), null);
  assert.equal(exhausted.calls.length, 0);
});
void test('social editor rejects invented/duplicate IDs, rewrites and unsupported absence with bounded repairs', async () => {
  for (const output of [
    { posts: [{ ...post, id: 'invented' }] },
    { posts: [post, post] },
    { posts: [{ ...post, text: 'Replacement text' }] },
    {
      posts: [
        {
          ...post,
          whyItMatters: 'The company has not confirmed availability.',
        },
      ],
    },
    { posts: [{ ...post, rationale: 'There is no release date.' }] },
    { posts: [{ ...post, whyItMatters: 'x'.repeat(401) }] },
  ]) {
    const h = harness([output]);
    assert.equal(await h.editor.edit(topic, candidates, 1, 'run'), null);
    assert.equal(h.calls.length, 4);
  }
});
void test('quiet/zero budget social selections make no calls and invalid inputs fail before inference', async () => {
  const h = harness([{ posts: [] }]);
  assert.deepEqual(
    (await h.editor.edit(topic, candidates, 1, 'run'))?.posts,
    [],
  );
  const empty = harness();
  assert.deepEqual(await empty.editor.edit(topic, candidates, 0, 'run'), {
    posts: [],
    model: 'none',
  });
  assert.deepEqual(await empty.editor.edit(topic, [], 5, 'run'), {
    posts: [],
    model: 'none',
  });
  for (const budget of [-1, 21, 1.5])
    await assert.rejects(empty.editor.edit(topic, candidates, budget, 'run'));
  await assert.rejects(
    empty.editor.edit(topic, [candidates[0], candidates[0]], 2, 'run'),
  );
  await assert.rejects(
    empty.editor.edit(topic, [{ ...candidates[0], relevance: NaN }], 1, 'run'),
  );
  assert.equal(empty.calls.length, 0);
});

void test('Bluesky editor uses isolated purpose and observation instructions', async () => {
  const h = harness();
  await h.editor.edit(
    topic,
    [{ ...candidates[0], platform: 'bluesky' }],
    1,
    'bluesky',
  );
  assert.equal(h.calls[0].purpose, 'bluesky-social-editor-v1');
  assert.match(h.calls[0].instructions, /official API observations/);
  assert.doesNotMatch(
    h.calls[0].instructions,
    /X posts come from verified embeds/,
  );
});

void test('existing cross-platform picks are bounded untrusted context, affect cache identity and cannot be selected', async () => {
  const h = harness();
  const bluesky = [{ ...candidates[0], platform: 'bluesky' as const }];
  const existing = [
    { platform: 'x' as const, text: 'Existing announcement', author: 'Lab' },
  ];
  await h.editor.edit(topic, bluesky, 1, 'first', existing);
  assert.deepEqual(JSON.parse(h.calls[0].prompt).alreadySelected, existing);
  assert.match(h.calls[0].instructions, /untrusted text/);
  assert.match(
    h.calls[0].instructions,
    /same announcement, clip or moment across platforms/,
  );
  assert.match(h.calls[0].instructions, /distinct developments may qualify/);
  await h.editor.edit(topic, bluesky, 1, 'cached', existing);
  assert.equal(h.calls.length, 1);
  await h.editor.edit(topic, bluesky, 1, 'changed', [
    { ...existing[0], text: 'Different announcement' },
  ]);
  assert.equal(h.calls.length, 2);
  const bounded = harness();
  await bounded.editor.edit(topic, bluesky, 1, 'bounded', [
    { ...existing[0], text: 'x'.repeat(2000), author: 'a'.repeat(300) },
  ]);
  const context = JSON.parse(bounded.calls[0].prompt).alreadySelected[0];
  assert.equal(context.text.length, 1200);
  assert.equal(context.author.length, 200);
  await assert.rejects(
    bounded.editor.edit(
      topic,
      bluesky,
      1,
      'too many',
      Array.from({ length: 21 }, () => existing[0]),
    ),
  );
  assert.equal(bounded.calls.length, 1);
  const invalid = harness([{ posts: [{ ...post, id: 'existing-pick' }] }]);
  assert.equal(
    await invalid.editor.edit(topic, bluesky, 1, 'invalid', existing),
    null,
  );
  assert.equal(invalid.calls.length, 4);
});

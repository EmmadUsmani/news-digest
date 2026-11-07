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
  assert.match(h.calls[0].instructions, /Social editor v8/);
  assert.match(
    h.calls[0].instructions,
    /essential news appears only in an unseen/,
  );
  assert.match(
    h.calls[0].instructions,
    /highlight with a concrete result or stat line can qualify/,
  );
  assert.match(h.calls[0].instructions, /do not rewrite/);
  assert.match(
    h.calls[0].instructions,
    /descending editorial quality, strongest first and weakest last/,
  );
  assert.deepEqual(candidates[0].text, 'A company announced a model.');
});
void test('originality and substantial-development guidance reaches Sonnet and capped Haiku', async () => {
  for (const refuse of [[], ['claude-sonnet-5-5']]) {
    const h = harness([valid], refuse);
    assert.ok(await h.editor.edit(topic, candidates, 1, 'originality'));
    assert.equal(h.calls.length, 1);
    const prompt = h.calls[0].instructions;
    assert.match(prompt, /Prefer firsthand announcements/);
    assert.match(
      prompt,
      /Apply this comparison to event reactions and promotional campaigns/,
    );
    assert.match(prompt, /opposing opinions about the same appointment/);
    assert.match(
      prompt,
      /without independently newsworthy supplied developments/,
    );
    assert.match(
      prompt,
      /a shared person, team or franchise alone does not make distinct events duplicates/,
    );
    assert.match(
      prompt,
      /Routine availability lists, questionable\/probable status updates/,
    );
    assert.match(prompt, /supplied text establishes a substantial development/);
    assert.match(prompt, /not a blanket exclusion of injury or roster news/);
    assert.match(
      prompt,
      /newsletter excerpts, generic news roundups or secondhand recaps/,
    );
    assert.match(prompt, /Judge originality from supplied text only/);
    assert.match(prompt, /Secondhand reporting can qualify/);
    assert.match(prompt, /never assume an account is the original source/);
  }
});
void test('self-explanatory posts can keep their slot without a repetitive reader note', async () => {
  const selected = { posts: [{ ...post, whyItMatters: '' }] };
  const h = harness([selected]);
  const first = await h.editor.edit(topic, candidates, 1, 'first');
  assert.deepEqual(first, { ...selected, model: 'claude-sonnet-5-5' });
  assert.equal(first?.droppedPosts, undefined);
  assert.deepEqual(await h.editor.edit(topic, candidates, 1, 'cached'), first);
  assert.equal(h.calls.length, 1);
  assert.match(h.calls[0].instructions, /rather than paraphrase or repeat/);
  assert.match(
    h.calls[0].instructions,
    /English translation of a non-English post/,
  );
  assert.match(
    h.calls[0].instructions,
    /Never invent background to fill the note/,
  );
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
    [
      {
        ...candidates[0],
        platform: 'bluesky',
        engagementEvidence:
          'Bluesky API observation: likes 767, reposts 342, replies 329.',
      },
    ],
    1,
    'bluesky',
  );
  assert.equal(h.calls[0].purpose, 'bluesky-social-editor-v2');
  assert.match(h.calls[0].instructions, /official API observations/);
  assert.match(
    h.calls[0].instructions,
    /Use supplied engagementEvidence as advisory/,
  );
  assert.match(
    h.calls[0].instructions,
    /Bluesky counts are timestamped API observations/,
  );
  assert.match(h.calls[0].instructions, /Missing counts are unknown, not zero/);
  assert.match(
    h.calls[0].instructions,
    /does not establish measured growth, account-relative reach or virality/,
  );
  assert.match(
    h.calls[0].instructions,
    /Never infer virality or describe unseen video/,
  );
  assert.doesNotMatch(h.calls[0].instructions, /Engagement.*not supplied/);
  assert.equal(
    JSON.parse(h.calls[0].prompt).candidates[0].engagementEvidence,
    'Bluesky API observation: likes 767, reposts 342, replies 329.',
  );
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

void test('engagement evidence reaches the editor bounded and changes cached selection identity', async () => {
  const h = harness();
  await h.editor.edit(topic, candidates, 1, 'unknown');
  const reported = [
    {
      ...candidates[0],
      engagementEvidence:
        'Unverified xai_search likes 12; observed 2026-11-02T01:00:00Z.',
    },
  ];
  await h.editor.edit(topic, reported, 1, 'reported');
  assert.equal(h.calls.length, 2);
  assert.equal(
    JSON.parse(h.calls[1].prompt).candidates[0].engagementEvidence,
    reported[0].engagementEvidence,
  );
  assert.match(h.calls[1].instructions, /Missing counts are unknown, not zero/);
  assert.match(h.calls[1].instructions, /never as proof of truth/);
  await h.editor.edit(topic, reported, 1, 'cached');
  assert.equal(h.calls.length, 2);
  await h.editor.edit(
    topic,
    [{ ...candidates[0], engagementEvidence: 'x'.repeat(2000) }],
    1,
    'bounded',
  );
  assert.equal(
    JSON.parse(h.calls[2].prompt).candidates[0].engagementEvidence.length,
    1200,
  );
});

void test('social editor compacts long IDs without collisions and restores identities on cache hits', async () => {
  const longId = `bluesky:at://did:plc:${'a'.repeat(40)}/app.bsky.feed.post/123`;
  const input = [
    { ...candidates[0], id: longId, platform: 'bluesky' as const },
    { ...candidates[0], id: 'post1', text: 'A distinct launch.' },
    { ...candidates[0], id: '_post1', text: 'Another distinct launch.' },
  ];
  const before = structuredClone(input);
  const output = { posts: [{ ...post, id: '__post1' }] };
  const h = harness([output]);
  const first = await h.editor.edit(topic, input, 1, 'compact');
  assert.equal(first?.posts[0].id, longId);
  assert.deepEqual(input, before);
  const wire = JSON.parse(h.calls[0].prompt).candidates;
  assert.deepEqual(
    wire.map((c: { id: string }) => c.id),
    ['__post1', 'post1', '_post1'],
  );
  assert.ok(!h.calls[0].prompt.includes(longId));
  assert.equal(h.calls[0].maxOutputTokens, 4000);
  assert.deepEqual(await h.editor.edit(topic, input, 1, 'cached'), first);
  assert.equal(h.calls.length, 1);

  // A wire cache stores aliases, so equivalent evidence can restore a new
  // original identity without leaking the previous caller's ID.
  const renamed = structuredClone(input);
  renamed[0].id = longId.replace('/123', '/456');
  const reused = await h.editor.edit(topic, renamed, 1, 'renamed');
  assert.equal(reused?.posts[0].id, renamed[0].id);
  assert.equal(h.calls.length, 1);

  // Source IDs are not valid wire selections, even if they belong to input.
  const invalid = harness([{ posts: [{ ...post, id: longId }] }]);
  assert.equal(await invalid.editor.edit(topic, input, 1, 'invalid'), null);
  assert.equal(invalid.calls.length, 4);
});

void test('social selection repairs receive fixed ID/budget guidance and recover without fallback', async () => {
  const privateId = 'untrusted-id-do-not-copy-into-repair';
  const second = { ...post, id: 'two' };
  for (const platform of ['x'] as const) {
    for (const invalid of [
      { posts: [{ ...post, id: privateId }] },
      { posts: [post, post] },
      { posts: [post, second] },
    ]) {
      const h = harness([invalid, valid]);
      const input = [
        { ...candidates[0], platform },
        { ...candidates[0], id: 'two', platform },
      ];
      const result = await h.editor.edit(topic, input, 1, 'repair');
      assert.deepEqual(result, { ...valid, model: 'claude-sonnet-5-5' });
      assert.equal(h.calls.length, 2);
      const repair = h.calls[1].prompt.slice(h.calls[0].prompt.length);
      assert.match(repair, /only IDs from candidates, each at most once/);
      assert.match(repair, /at most the supplied budget/);
      assert.match(repair, /empty array are acceptable/);
      assert.ok(!repair.includes(privateId));
      assert.deepEqual(h.diagnostics(), [
        { attempt: 'initial', category: 'invalid-social-selection' },
      ]);
      await h.editor.edit(topic, input, 1, 'cached');
      assert.equal(h.calls.length, 2);
    }
  }
  const invalid = harness([{ posts: [{ ...post, id: privateId }] }]);
  assert.equal(
    await invalid.editor.edit(topic, candidates, 1, 'invalid'),
    null,
  );
  assert.equal(invalid.calls.length, 4);
  assert.ok(
    invalid
      .diagnostics()
      .every((d) => d.category === 'invalid-social-selection'),
  );
});

void test('social editor retains refusal and validation evidence across fallback models', async () => {
  const refused = harness([valid], ['claude-sonnet-5-5', 'claude-haiku-5-5']);
  assert.deepEqual(
    await refused.editor.editOutcome(topic, candidates, 1, 'refused'),
    {
      status: 'failed',
      failures: ['budget-refused', 'budget-refused'],
    },
  );
  assert.equal(refused.calls.length, 0);
  const invalid = harness(
    [{ posts: [{ ...post, id: 'unknown' }] }],
    ['claude-haiku-5-5'],
  );
  assert.deepEqual(
    await invalid.editor.editOutcome(topic, candidates, 1, 'invalid'),
    {
      status: 'failed',
      failures: ['validation-failed', 'budget-refused'],
    },
  );
  const fallback = harness([valid], ['claude-sonnet-5-5']);
  assert.equal(
    (await fallback.editor.editOutcome(topic, candidates, 1, 'recovered'))
      .status,
    'complete',
  );
});

void test('Bluesky keeps valid picks, counts each rejection and reuses sanitized cache', async () => {
  const input = ['one', 'two', 'three'].map((id) => ({
    ...candidates[0],
    id,
    platform: 'bluesky' as const,
  }));
  const h = harness([
    {
      posts: [
        { ...post, whyItMatters: 'x'.repeat(401) },
        { ...post, id: 'unknown' },
        { ...post, rationale: 'There is no confirmed release date.' },
        post,
        post,
        { ...post, id: 'two' },
        { ...post, id: 'three' },
      ],
    },
  ]);
  const result = await h.editor.edit(topic, input, 2, 'partial');
  assert.deepEqual(
    result?.posts.map((p) => p.id),
    ['one', 'two'],
  );
  assert.deepEqual(result?.droppedPosts, {
    invalidFields: 1,
    unknownId: 1,
    repeatedId: 1,
    unsupportedClaim: 1,
    overBudget: 1,
  });
  assert.equal(h.calls.length, 1);
  assert.deepEqual(await h.editor.edit(topic, input, 2, 'cached'), result);
  assert.equal(h.calls.length, 1);
});

void test('Bluesky retries an entirely invalid reply, but accepts deliberate empty replies', async () => {
  const input = candidates.map((c) => ({ ...c, platform: 'bluesky' as const }));
  const h = harness([
    { posts: [{ ...post, rationale: 'No release date exists.' }] },
    valid,
  ]);
  const result = await h.editor.edit(topic, input, 1, 'repair');
  assert.deepEqual(result?.posts, valid.posts);
  assert.equal(result?.droppedPosts?.unsupportedClaim, 1);
  assert.equal(h.calls.length, 2);
  assert.deepEqual(
    await h.editor.edit(topic, input, 1, 'cached-repair'),
    result,
  );
  const empty = harness([{ posts: [] }]);
  assert.deepEqual(
    (await empty.editor.edit(topic, input, 1, 'empty'))?.posts,
    [],
  );
  assert.equal(empty.calls.length, 1);
  const failed = harness([{ posts: [{ ...post, id: 'unknown' }] }]);
  const outcome = await failed.editor.editOutcome(topic, input, 1, 'failed');
  assert.equal(outcome.status, 'failed');
  assert.equal(
    outcome.status === 'failed' && outcome.droppedPosts?.unknownId,
    4,
  );
});

void test('Bluesky all-rejected absence claims retain field-specific repair guidance', async () => {
  const input = candidates.map((c) => ({ ...c, platform: 'bluesky' as const }));
  for (const field of ['whyItMatters', 'rationale'] as const) {
    const rejectedText = 'There is no private-untrusted-release-marker.';
    const h = harness([{ posts: [{ ...post, [field]: rejectedText }] }, valid]);
    const result = await h.editor.edit(topic, input, 1, 'absence-repair');
    assert.deepEqual(result?.posts, valid.posts);
    assert.equal(result?.droppedPosts?.unsupportedClaim, 1);
    assert.equal(h.calls.length, 2);
    const repair = h.calls[1].prompt.slice(h.calls[0].prompt.length);
    assert.match(repair, /failed the absence-support check/);
    assert.ok(repair.includes(`The rejected field was ${field}.`));
    assert.ok(!repair.includes(rejectedText));
    assert.ok(!repair.includes('private-untrusted-release-marker'));
    assert.equal(h.diagnostics()[0].category, 'unsupported-absence');
    assert.equal(h.diagnostics()[0].field, field);
    assert.deepEqual(await h.editor.edit(topic, input, 1, 'cached'), result);
    assert.equal(h.calls.length, 2);
  }
});

void test('Bluesky absence exhaustion remains bounded and counts all rejected picks', async () => {
  const input = candidates.map((c) => ({ ...c, platform: 'bluesky' as const }));
  const h = harness([
    { posts: [{ ...post, rationale: 'No release date exists.' }] },
  ]);
  const result = await h.editor.editOutcome(topic, input, 1, 'exhausted');
  assert.equal(result.status, 'failed');
  assert.equal(
    result.status === 'failed' && result.droppedPosts?.unsupportedClaim,
    4,
  );
  assert.equal(h.calls.length, 4);
  assert.ok(h.diagnostics().every((d) => d.category === 'unsupported-absence'));
});

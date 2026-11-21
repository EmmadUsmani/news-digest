import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import type { SelectedSocialPost } from '@digest/contracts';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { SocialPostEditor } from '../src/modules/curation/application/social-editor';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';
import { socialStoryContext } from '../src/modules/digests/domain/social-story-context';
import { previewJointEventSelection } from '../src/modules/social/public/joint-event-editor';

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
  assert.match(h.calls[0].instructions, /Social editor v13/);
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
    /English translation of its essential news/,
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

void test('saved awards overlap reaches cross-platform comparison in both model routes', async () => {
  const saved = JSON.parse(
    readFileSync(
      new URL('./fixtures/social-awards-2026-11-12.json', import.meta.url),
      'utf8',
    ),
  );
  const official = saved.posts.find(
    (p: { platform: string }) => p.platform === 'x',
  );
  const recap = saved.posts.find(
    (p: { platform: string }) => p.platform === 'bluesky',
  );
  assert.match(official.text, /Console Game of the Year/);
  assert.match(recap.text, /Ultimate Game of the Year/);
  for (const refuse of [[], ['claude-sonnet-5-5']]) {
    // Responses are simulated: this verifies transport/selection, not live semantic quality.
    const h = harness(
      [{ posts: [] }, { posts: [{ ...post, id: 'release' }] }],
      refuse,
    );
    const input = [
      {
        ...candidates[0],
        id: 'awards',
        platform: 'bluesky' as const,
        text: recap.text,
        author: recap.author,
        publishedAt: recap.publishedAt,
      },
    ];
    const existing = [
      { platform: 'x' as const, text: official.text, author: official.author },
    ];
    const gaming = { ...topic, name: 'Gaming', description: 'Video game news' };
    assert.deepEqual(
      (await h.editor.edit(gaming, input, 1, 'awards', existing))?.posts,
      [],
    );
    const wire = JSON.parse(h.calls[0].prompt);
    assert.equal(wire.candidates[0].text, recap.text);
    assert.deepEqual(wire.alreadySelected, existing);
    assert.match(
      h.calls[0].instructions,
      /extra categories, a top prize or an associated studio award add detail/,
    );
    assert.match(
      h.calls[0].instructions,
      /comparing candidates against alreadySelected/,
    );
    assert.match(
      h.calls[0].instructions,
      /separately announced release or a later independent development can still qualify/,
    );
    const separate = [
      {
        ...input[0],
        id: 'release',
        text: 'Resident Evil announced a separate game release.',
      },
    ];
    assert.equal(
      (await h.editor.edit(gaming, separate, 1, 'release', existing))?.posts[0]
        .id,
      'release',
    );
    assert.equal(
      separate[0].text,
      'Resident Evil announced a separate game release.',
    );
    assert.equal(h.calls.length, 2);
  }
});

void test('saved publisher link list stays unexpanded while substantive linked prose remains eligible', async () => {
  const saved = JSON.parse(
    readFileSync(
      new URL('./fixtures/social-link-list-2026-11-12.json', import.meta.url),
      'utf8',
    ),
  );
  for (const refuse of [[], ['claude-sonnet-5-5']]) {
    // Simulated selections check the contract, not a live model's quality judgment.
    const h = harness(
      [{ posts: [] }, { posts: [{ ...post, id: 'report' }] }],
      refuse,
    );
    const input = [
      {
        ...candidates[0],
        id: saved.post.externalId,
        platform: 'bluesky' as const,
        text: saved.post.text,
        author: saved.post.author,
        publishedAt: saved.post.publishedAt,
      },
    ];
    const world = {
      ...topic,
      name: saved.topic,
      description: 'International news',
    };
    assert.deepEqual(
      (await h.editor.edit(world, input, 1, 'links'))?.posts,
      [],
    );
    assert.equal(
      JSON.parse(h.calls[0].prompt).candidates[0].text,
      saved.post.text,
    );
    assert.match(
      h.calls[0].instructions,
      /URL slugs alone do not establish a supplied news development/,
    );
    assert.match(
      h.calls[0].instructions,
      /do not reconstruct an article from its URL/,
    );
    assert.match(
      h.calls[0].instructions,
      /linked post can qualify when its own supplied prose conveys substantive news/,
    );
    const reporting = [
      {
        ...input[0],
        id: 'report',
        text: 'The ministry announced a prisoner exchange involving 200 people today. https://example.org/report',
      },
    ];
    assert.equal(
      (await h.editor.edit(world, reporting, 1, 'report'))?.posts[0].id,
      'report',
    );
    assert.equal(
      JSON.parse(h.calls[1].prompt).candidates[0].text,
      reporting[0].text,
    );
    assert.equal(h.calls.length, 2);
  }
});

void test('saved airline overlap receives bounded story context without licensing post claims', async () => {
  const saved = JSON.parse(
    readFileSync(
      new URL(
        './fixtures/social-story-overlap-2026-11-12.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  for (const refuse of [[], ['claude-sonnet-5-5']]) {
    const h = harness(
      [{ posts: [] }, { posts: [{ ...post, id: 'separate' }] }],
      refuse,
    );
    const input = [
      {
        ...candidates[0],
        platform: 'bluesky' as const,
        text: saved.post.text,
        author: saved.post.author,
        publishedAt: saved.post.publishedAt,
      },
    ];
    const covered = [
      { title: saved.story.title, summary: saved.story.summary },
    ];
    // Simulated decisions prove transport/cache isolation, not model compliance.
    assert.deepEqual(
      (await h.editor.edit(topic, input, 1, 'overlap', [], covered))?.posts,
      [],
    );
    assert.deepEqual(JSON.parse(h.calls[0].prompt).coveredStories, covered);
    assert.equal(
      JSON.parse(h.calls[0].prompt).candidates[0].text,
      saved.post.text,
    );
    assert.match(h.calls[0].instructions, /comparison context only/);
    assert.match(h.calls[0].instructions, /consequential trade/);
    assert.match(
      h.calls[0].instructions,
      /shared players or teams alone are not grounds to reject it/,
    );
    assert.match(h.calls[0].instructions, /original contribution/);
    assert.equal(
      (
        await h.editor.edit(
          topic,
          [
            {
              ...input[0],
              id: 'separate',
              text: 'United Airlines released a separate agent-booking demo.',
            },
          ],
          1,
          'separate',
          [],
          covered,
        )
      )?.posts[0].id,
      'separate',
    );
  }
  const h = harness([{ posts: [] }]);
  await h.editor.edit(
    topic,
    candidates,
    1,
    'bounded',
    [],
    [{ title: 'T'.repeat(500), summary: 'S'.repeat(800) }],
  );
  assert.deepEqual(JSON.parse(h.calls[0].prompt).coveredStories, [
    { title: 'T'.repeat(300), summary: 'S'.repeat(400) },
  ]);
  await h.editor.edit(topic, candidates, 1, 'no-context');
  assert.equal(h.calls.length, 2);
  assert.ok(!('coveredStories' in JSON.parse(h.calls[1].prompt)));
  assert.ok(!h.calls[1].instructions.includes('CoveredStories contains'));
  await assert.rejects(
    h.editor.edit(
      topic,
      candidates,
      1,
      'too-many',
      [],
      Array.from({ length: 11 }, () => ({ title: 't', summary: 's' })),
    ),
  );
});

void test('NBA comparison context reaches both model routes and preserves a distinct follow-up', async () => {
  const covered = [
    {
      title: 'Murray requests a trade',
      summary: 'Murray asked his team to trade him.',
    },
  ];
  const input = [
    {
      ...candidates[0],
      id: 'separate',
      text: 'The team has now completed a trade for Murray.',
    },
  ];
  for (const refuse of [[], ['claude-sonnet-5-5']]) {
    const h = harness([{ posts: [{ ...post, id: 'separate' }] }], refuse);
    const result = await h.editor.edit(
      { ...topic, name: 'NBA' },
      input,
      1,
      'nba-context',
      [],
      covered,
    );
    assert.equal(result?.posts[0].id, 'separate');
    assert.deepEqual(JSON.parse(h.calls[0].prompt).coveredStories, covered);
    assert.equal(
      JSON.parse(h.calls[0].prompt).candidates[0].text,
      input[0].text,
    );
    assert.match(h.calls[0].instructions, /comparison context only/);
    assert.match(h.calls[0].instructions, /consequential trade/);
    assert.match(
      h.calls[0].instructions,
      /shared players or teams alone are not grounds to reject it/,
    );
    // Synthetic decision tests transport, not future semantic model compliance.
  }
});

void test('saved NBA game repetition can be declined with all preceding X texts on both routes', async () => {
  const saved = JSON.parse(
    readFileSync(
      new URL(
        '../../../docs/edition-reviews/2026-11-18-bluesky-selection.json',
        import.meta.url,
      ),
      'utf8',
    ),
  ) as {
    topics: {
      topic: string;
      posts: { author: string; text: string; publishedAt: string }[];
      otherPostTexts: { author: string; text: string }[];
    }[];
  };
  const nba = saved.topics.find((entry) => entry.topic === 'NBA');
  assert.ok(nba);
  const preceding = nba.otherPostTexts.map((entry) => ({
    ...entry,
    platform: 'x' as const,
  }));
  for (const refuse of [[], ['claude-sonnet-5-5']]) {
    // Hand-authored refusal tests request/response transport, not model judgment.
    const h = harness([{ posts: [] }], refuse);
    const result = await h.editor.edit(
      { ...topic, name: 'NBA' },
      [
        {
          ...candidates[0],
          ...nba.posts[0],
          platform: 'bluesky',
        },
      ],
      2,
      'saved-nba-game-comparison',
      preceding,
    );
    assert.deepEqual(result?.posts, []);
    const request = JSON.parse(h.calls[0].prompt);
    assert.deepEqual(request.alreadySelected, preceding);
    assert.equal(request.candidates[0].text, nba.posts[0].text);
    assert.equal(request.candidates[0].author, nba.posts[0].author);
    assert.equal(request.budget, 2);
    assert.match(h.calls[0].instructions, /Return fewer than the budget/);
    assert.match(
      h.calls[0].instructions,
      /Extra statistics alone do not justify another slot/,
    );
    assert.match(
      h.calls[0].instructions,
      /do not invent a shared game identity/,
    );
    // Exercise the earlier X-only pass too: later Bluesky cannot remove X picks.
    const first = harness(
      [
        {
          posts: [
            {
              id: 'x1',
              whyItMatters: '',
              rationale: 'Lakers have won nine straight games.',
            },
          ],
        },
      ],
      refuse,
    );
    const xCandidates = preceding.map((entry, index) => ({
      ...candidates[0],
      ...entry,
      id: `x${index}`,
      publishedAt: nba.posts[0].publishedAt,
    }));
    const xResult = await first.editor.edit(
      { ...topic, name: 'NBA' },
      xCandidates,
      3,
      'saved-nba-x-comparison',
    );
    assert.deepEqual(
      xResult?.posts.map((entry) => entry.id),
      ['x1'],
    );
    assert.deepEqual(
      JSON.parse(first.calls[0].prompt).candidates.map(
        (entry: { text: string }) => entry.text,
      ),
      preceding.map((entry) => entry.text),
    );
    assert.match(
      first.calls[0].instructions,
      /within the first X selection as well as against alreadySelected/,
    );
    assert.match(first.calls[0].instructions, /vague overtime teaser/);
    assert.match(
      first.calls[0].instructions,
      /separately reported contract decision/,
    );
  }
});

void test('saved French clip reaches both editor routes with source-bound English context', async () => {
  const saved = JSON.parse(
    readFileSync(
      new URL('./fixtures/social-translation-2026-11-12.json', import.meta.url),
      'utf8',
    ),
  );
  assert.match(saved.post.text, /potentielle séquence en jeu/);
  assert.match(saved.post.whyItMatters, /Nov 19/);
  const translation =
    'The post describes a possible GTA VI gameplay clip shared by Only In Dade and reportedly reshared by Rockstar on Instagram.';
  for (const refuse of [[], ['claude-sonnet-5-5']]) {
    // Simulated translation verifies transport and validation, not model compliance.
    const selected = {
      id: 'clip',
      whyItMatters: translation,
      rationale: 'A reported Rockstar reshare of a possible gameplay clip.',
    };
    const h = harness([{ posts: [selected] }], refuse);
    const input = [
      {
        ...candidates[0],
        id: 'clip',
        platform: 'x' as const,
        text: saved.post.text,
        author: saved.post.author,
        publishedAt: saved.post.publishedAt,
      },
    ];
    const result = await h.editor.edit(
      { ...topic, name: 'Gaming' },
      input,
      1,
      'translation',
    );
    assert.deepEqual(result?.posts, [selected]);
    assert.equal(
      JSON.parse(h.calls[0].prompt).candidates[0].text,
      saved.post.text,
    );
    assert.equal(input[0].text, saved.post.text);
    assert.match(
      h.calls[0].instructions,
      /English translation of its essential news, preserving attribution and uncertainty/,
    );
    assert.match(
      h.calls[0].instructions,
      /Do not turn a possible clip into confirmed gameplay or add launch dates/,
    );
    assert.equal(h.calls.length, 1);
  }
});

void test('saved Gaming launch date is refused and repaired using only the selected post', async () => {
  const saved = JSON.parse(
    readFileSync(
      new URL('./fixtures/social-translation-2026-11-12.json', import.meta.url),
      'utf8',
    ),
  );
  for (const platform of ['x', 'bluesky'] as const) {
    for (const refuse of [[], ['claude-sonnet-5-5']]) {
      const invented = {
        id: 'clip',
        whyItMatters: saved.post.whyItMatters,
        rationale: 'A possible gameplay clip.',
      };
      const corrected = {
        ...invented,
        whyItMatters:
          'The post describes a possible GTA VI gameplay clip reportedly reshared by Rockstar.',
      };
      const h = harness(
        [{ posts: [invented] }, { posts: [corrected] }],
        refuse,
      );
      const result = await h.editor.edit(
        { ...topic, name: 'Gaming' },
        [
          {
            ...candidates[0],
            id: 'clip',
            platform,
            text: saved.post.text,
            publishedAt: '2026-11-19T00:00:00Z',
          },
          {
            ...candidates[0],
            id: 'other',
            platform,
            text: 'The launch is Nov 19.',
          },
        ],
        1,
        'saved-date',
        [{ platform: 'x', text: 'The launch is Nov 19.', author: 'Other' }],
        [{ title: 'Nov 19 launch', summary: 'The game launches Nov 19.' }],
      );
      assert.deepEqual(result?.posts, [corrected]);
      assert.equal(h.calls.length, 2);
      assert.match(
        h.calls[1].prompt,
        /previous response added a calendar date absent/,
      );
      assert.equal(
        JSON.parse(h.calls[0].prompt).candidates[0].text,
        saved.post.text,
      );
    }
  }
});

void test('Gaming date check also constrains rationales and preserves supported translations', async () => {
  const invalid = {
    ...post,
    whyItMatters: '',
    rationale: 'A launch on Nov 19.',
  };
  const h = harness([{ posts: [invalid] }]);
  assert.equal(
    await h.editor.edit(
      { ...topic, name: 'Gaming' },
      candidates,
      1,
      'date-refusal',
    ),
    null,
  );
  assert.equal(h.calls.length, 4);
  const supported = harness([{ posts: [invalid] }]);
  assert.deepEqual(
    (
      await supported.editor.edit(
        { ...topic, name: 'Gaming' },
        [{ ...candidates[0], text: 'Sortie le 19 novembre.' }],
        1,
        'date-supported',
      )
    )?.posts,
    [invalid],
  );
  const unchanged = harness([{ posts: [invalid] }]);
  assert.deepEqual(
    (
      await unchanged.editor.edit(
        { ...topic, name: 'NBA' },
        candidates,
        1,
        'nba-unchanged',
      )
    )?.posts,
    [invalid],
  );
  assert.ok(!unchanged.calls[0].instructions.includes('Gaming date support'));
});

void test('saved U.S. election overlap and distinct stock-trading post receive selected-story context on both routes', async () => {
  const saved = JSON.parse(
    readFileSync(
      new URL(
        './fixtures/us-social-story-overlap-2026-11-18.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  const usTopic = { ...topic, id: 'us', name: 'U.S. news & politics' };
  const covered = socialStoryContext([saved.story]);
  assert.equal(covered.length, 1);
  for (const platform of ['x', 'bluesky'] as const) {
    for (const refuse of [[], ['claude-sonnet-5-5']]) {
      // Hand-authored selection tests transport, not semantic model compliance.
      const h = harness(
        [
          {
            posts: [
              {
                id: 'distinct',
                whyItMatters: '',
                rationale:
                  'Dan Koh is joining 50 incoming Democrats in demanding a ban on stock trading by members of Congress.',
              },
            ],
          },
        ],
        refuse,
      );
      const input = [
        { ...candidates[0], ...saved.overlappingPost, id: 'overlap', platform },
        { ...candidates[0], ...saved.distinctPost, id: 'distinct', platform },
      ];
      const result = await h.editor.edit(
        usTopic,
        input,
        2,
        'us-overlap',
        [],
        covered,
      );
      assert.deepEqual(
        result?.posts.map((p) => p.id),
        ['distinct'],
      );
      const prompt = JSON.parse(h.calls[0].prompt);
      assert.deepEqual(prompt.coveredStories, covered);
      assert.equal(prompt.candidates[0].text, saved.overlappingPost.text);
      assert.equal(prompt.candidates[1].text, saved.distinctPost.text);
      assert.match(h.calls[0].instructions, /comparison context only/);
      assert.match(h.calls[0].instructions, /distinct substantive development/);
      assert.deepEqual(
        await h.editor.edit(usTopic, input, 2, 'us-cached', [], covered),
        result,
      );
      assert.equal(h.calls.length, 1);
    }
  }
});

void test('saved Gaming milestone overlap and distinct nomination receive selected stories on both model and platform routes', async () => {
  const saved = JSON.parse(
    readFileSync(
      new URL(
        './fixtures/gaming-social-story-overlap-2026-11-18.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  const gamingTopic = { ...topic, id: 'gaming', name: 'Gaming' };
  const covered = socialStoryContext([saved.story]);
  for (const platform of ['x', 'bluesky'] as const) {
    for (const refuse of [[], ['claude-sonnet-5-5']]) {
      // Hand-authored output verifies context transport, not model compliance.
      const h = harness(
        [
          {
            posts: [
              {
                id: 'distinct',
                whyItMatters: '',
                rationale:
                  'CONTROL Resonant has been nominated in six categories in The Game Awards, including Game of the Year.',
              },
            ],
          },
        ],
        refuse,
      );
      const input = [
        { ...candidates[0], ...saved.overlappingPost, id: 'overlap', platform },
        { ...candidates[0], ...saved.distinctPost, id: 'distinct', platform },
      ];
      const result = await h.editor.edit(
        gamingTopic,
        input,
        2,
        'gaming-overlap',
        [],
        covered,
      );
      assert.deepEqual(
        result?.posts.map((p) => p.id),
        ['distinct'],
      );
      const prompt = JSON.parse(h.calls[0].prompt);
      assert.deepEqual(prompt.coveredStories, covered);
      assert.equal(prompt.candidates[0].text, saved.overlappingPost.text);
      assert.equal(prompt.candidates[1].text, saved.distinctPost.text);
      assert.match(h.calls[0].instructions, /comparison context only/);
      assert.match(h.calls[0].instructions, /distinct substantive development/);
      assert.deepEqual(
        await h.editor.edit(
          gamingTopic,
          input,
          2,
          'gaming-cached',
          [],
          covered,
        ),
        result,
      );
      assert.equal(h.calls.length, 1);
    }
  }
});

void test('saved clipped X posts retain visible evidence and request clipping is explicit on both routes', async () => {
  const saved = JSON.parse(
    readFileSync(
      new URL(
        '../../../docs/edition-reviews/2026-11-18-bluesky-selection.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  const texts = saved.topics
    .flatMap((t: { otherPostTexts: { text: string }[] }) => t.otherPostTexts)
    .map((p: { text: string }) => p.text)
    .filter((text: string) => /… pic\.twitter/.test(text));
  assert.equal(texts.length, 2);
  for (const refuse of [[], ['claude-sonnet-5-5']]) {
    const h = harness([{ posts: [] }], refuse);
    const input = [
      ...texts,
      'A complete reported opening. ' + 'Additional context. '.repeat(100),
    ].map((text, i) => ({
      ...candidates[0],
      id: `clip${i}`,
      platform: 'x' as const,
      text,
    }));
    await h.editor.edit(topic, input, 3, 'clipped');
    const wire = JSON.parse(h.calls[0].prompt).candidates;
    assert.deepEqual(
      wire.slice(0, 2).map((c: { text: string }) => c.text),
      texts,
    );
    assert.ok(wire.slice(0, 2).every((c: object) => !('textTruncated' in c)));
    assert.equal(wire[2].text.length, 1200);
    assert.equal(wire[2].textTruncated, true);
    assert.equal(input[2].text.length > 1200, true);
    assert.match(
      h.calls[0].instructions,
      /never complete the missing claim, quotation or qualification/,
    );
    assert.match(
      h.calls[0].instructions,
      /complete substantive opening can qualify/,
    );
    assert.match(
      h.calls[0].instructions,
      /Do not infer what follows a trailing negation/,
    );
  }
});

void test('opt-in event review shares selection call, binds bounded evidence and restores long IDs on cache reads', async () => {
  const id =
    'at://did:plc:long-author-identity/app.bsky.feed.post/very-long-id';
  const input = [{ ...candidates[0], id, platform: 'bluesky' as const }];
  const annotations = [
    {
      id: 'post1',
      event: 'launch',
      eventEvidence: 'announced a model',
      materialFacts: [{ id: 'announcement', evidence: 'announced a model' }],
    },
    {
      id: 'story1',
      event: 'launch',
      eventEvidence: 'Model launch',
      materialFacts: [],
    },
  ];
  const h = harness([
    { posts: [{ ...post, id: 'post1' }], eventAnnotations: annotations },
  ]);
  const run = (runId: string) =>
    h.editor.editOutcome(
      topic,
      input,
      1,
      runId,
      [],
      [{ title: 'Model launch', summary: 'A company announced a model.' }],
      { reviewEvents: true },
    );
  const result = await run('first');
  assert.equal(result.status, 'complete');
  if (result.status !== 'complete') return;
  assert.equal(result.value.posts[0].id, id);
  assert.deepEqual(result.value.eventReview?.candidates, [
    { id, text: input[0].text },
  ]);
  assert.equal(result.value.eventReview?.annotations[0].id, id);
  assert.equal(result.value.eventReview?.annotations[1].id, 'story1');
  assert.equal(
    result.value.eventReview?.stories[0].text,
    'Model launch\nA company announced a model.',
  );
  assert.deepEqual(await run('cached'), result);
  assert.equal(h.calls.length, 1);
  assert.match(h.calls[0].instructions, /Event review v2/);
  assert.equal(JSON.parse(h.calls[0].prompt).coveredStories[0].id, 'story1');
});

void test('bad or missing event annotations preserve valid picks without retry or cache contamination', async () => {
  for (const eventAnnotations of [
    undefined,
    [],
    [
      {
        id: 'one',
        event: 'launch',
        eventEvidence: 'unseen linked article',
        materialFacts: [],
      },
    ],
  ]) {
    const h = harness([
      {
        ...valid,
        ...(eventAnnotations === undefined ? {} : { eventAnnotations }),
      },
    ]);
    const run = () =>
      h.editor.editOutcome(topic, candidates, 1, 'review', [], [], {
        reviewEvents: true,
      });
    const result = await run();
    assert.equal(result.status, 'complete');
    if (result.status !== 'complete') continue;
    assert.deepEqual(result.value.posts, valid.posts);
    assert.equal(result.value.eventReview, null);
    assert.deepEqual(await run(), result);
    assert.equal(h.calls.length, 1);
  }
  const h = harness();
  await assert.rejects(() =>
    h.editor.editOutcome(
      topic,
      candidates,
      1,
      'partial',
      [{ text: 'Earlier post', author: 'A' }],
      [],
      { reviewEvents: true },
    ),
  );
  assert.equal(h.calls.length, 0);
});

void test('event preview admits only independently qualified replacements and revalidates cached qualification', async () => {
  const replacementId =
    'at://did:plc:replacement/app.bsky.feed.post/long-replacement-id';
  const input = [
    candidates[0],
    {
      ...candidates[0],
      id: replacementId,
      text: 'An independent lab released a robot.',
    },
    { ...candidates[0], id: 'weak', text: 'Watch this space.' },
  ];
  const annotations = [
    {
      id: 'one',
      event: 'launch',
      eventEvidence: 'announced a model',
      materialFacts: [],
    },
    {
      id: 'post2',
      event: 'robot',
      eventEvidence: 'released a robot',
      materialFacts: [],
    },
    {
      id: 'weak',
      event: 'teaser',
      eventEvidence: 'Watch this space',
      materialFacts: [],
    },
    {
      id: 'story1',
      event: 'launch',
      eventEvidence: 'Model launch',
      materialFacts: [],
    },
  ];
  const alternative = {
    id: 'post2',
    whyItMatters: 'A robot release.',
    rationale: 'A concrete independent launch.',
  };
  for (const qualifiedAlternatives of [
    [alternative],
    [],
    undefined,
    [{ ...alternative, id: 'unknown' }],
    [alternative, alternative],
    [post],
    [{ ...alternative, whyItMatters: 'No competitors exist.' }],
  ]) {
    const h = harness([
      {
        ...valid,
        eventAnnotations: annotations,
        ...(qualifiedAlternatives === undefined
          ? {}
          : { qualifiedAlternatives }),
      },
    ]);
    const run = () =>
      h.editor.editOutcome(
        topic,
        input,
        1,
        'preview',
        [],
        [{ title: 'Model launch', summary: 'A company announced a model.' }],
        { reviewEvents: true },
      );
    const result = await run();
    assert.equal(result.status, 'complete');
    if (result.status !== 'complete') continue;
    assert.deepEqual(result.value.posts, valid.posts);
    if (
      qualifiedAlternatives?.length === 1 &&
      qualifiedAlternatives[0] === alternative
    ) {
      assert.deepEqual(result.value.eventBudgetPreview, [
        { ...alternative, id: replacementId },
      ]);
    } else if (qualifiedAlternatives?.length === 0) {
      assert.deepEqual(result.value.eventBudgetPreview, valid.posts);
    } else {
      assert.equal(result.value.eventBudgetPreview, null);
    }
    assert.deepEqual(await run(), result);
    assert.equal(h.calls.length, 1);
  }
});

void test('event preview requires complete baseline and replacement text, including upstream story context', async () => {
  const story = {
    title: 'Model launch',
    summary: 'A company announced a model.',
  };
  for (const kind of [
    'complete',
    'expanded-summary',
    'expanded-overflow',
    'post',
    'title',
    'summary',
    'upstream',
    'omitted-story',
    'replacement',
    'replacement-boundary',
  ] as const) {
    const input = [
      {
        ...candidates[0],
        text:
          kind === 'post'
            ? candidates[0].text.padEnd(1200) + ' An exclusive new fact.'
            : candidates[0].text,
      },
      {
        ...candidates[0],
        id: 'robot',
        text:
          kind === 'replacement'
            ? 'An independent lab released a robot.'.padEnd(1200) +
              ' Correction: this release has been cancelled.'
            : kind === 'replacement-boundary'
              ? 'An independent lab released a robot.'.padEnd(1200)
              : 'An independent lab released a robot.',
      },
    ];
    const source = {
      title:
        kind === 'title' ? story.title.padEnd(300) + ' extra' : story.title,
      summary:
        kind === 'expanded-overflow'
          ? story.summary.padEnd(1200) + ' An exclusive new fact.'
          : kind === 'summary' ||
              kind === 'upstream' ||
              kind === 'expanded-summary'
            ? story.summary.padEnd(400) + ' An exclusive new fact.'
            : story.summary,
    };
    const covered =
      kind === 'upstream'
        ? socialStoryContext([source])
        : kind === 'omitted-story'
          ? socialStoryContext(Array.from({ length: 11 }, () => story))
          : [source];
    const h = harness([
      {
        ...valid,
        qualifiedAlternatives: [{ ...post, id: 'robot' }],
        eventAnnotations: [
          {
            id: 'one',
            event: 'launch',
            eventEvidence: 'announced a model',
            materialFacts: [],
          },
          {
            id: 'robot',
            event: 'robot',
            eventEvidence: 'released a robot',
            materialFacts: [],
          },
          ...covered.map((_, index) => ({
            id: `story${index + 1}`,
            event: 'launch',
            eventEvidence: 'Model launch',
            materialFacts: [],
          })),
        ],
      },
    ]);
    const run = () =>
      h.editor.editOutcome(topic, input, 1, kind, [], covered, {
        reviewEvents: true,
        completeStoryEvidence: kind.startsWith('expanded-'),
      });
    const result = await run();
    assert.equal(result.status, 'complete');
    if (result.status !== 'complete') continue;
    assert.deepEqual(result.value.posts, valid.posts);
    assert.ok(result.value.eventReview, kind);
    assert.deepEqual(
      result.value.eventBudgetPreview,
      kind === 'complete' ||
        kind === 'replacement-boundary' ||
        kind === 'expanded-summary'
        ? [{ ...post, id: 'robot' }]
        : null,
      kind,
    );
    assert.deepEqual(await run(), result);
    assert.equal(h.calls.length, 1, kind);
    if (kind === 'expanded-summary') {
      assert.equal(
        JSON.parse(h.calls[0].prompt).coveredStories[0].summary,
        source.summary,
      );
    }
    if (kind === 'complete') {
      const shortened = await h.editor.editOutcome(
        topic,
        input,
        1,
        kind,
        [],
        [{ ...story, textTruncated: true }],
        { reviewEvents: true },
      );
      assert.equal(shortened.status, 'complete');
      if (shortened.status === 'complete') {
        assert.deepEqual(shortened.value.posts, valid.posts);
        assert.equal(shortened.value.eventBudgetPreview, null);
      }
      assert.deepEqual(await run(), result);
      assert.equal(h.calls.length, 1);
    }
  }
});

void test('joint platform preview uses one real editor review and cache, preserving complete snapshots', async () => {
  const texts = [
    'A company announced a model.',
    'A lab released a robot.',
    'A studio released a game.',
  ];
  const snapshots: SelectedSocialPost[] = [
    {
      platform: 'x',
      externalId: 'one',
      url: 'https://x.com/lab/status/1',
      author: 'Lab',
      authorUrl: 'https://x.com/lab',
      publishedAt: candidates[0].publishedAt,
      text: texts[0],
      metrics: { likes: 42 },
      reasons: ['Qualified X'],
      displayText: 'Original display',
    },
    {
      platform: 'bluesky',
      externalId: 'robot',
      url: 'https://bsky.app/profile/lab/post/robot',
      author: 'Lab',
      publishedAt: candidates[0].publishedAt,
      observedAt: candidates[0].publishedAt,
      text: texts[1],
      metrics: { likes: 12, replies: 1, reposts: 2 },
      reasons: ['Qualified Bluesky'],
      media: [
        {
          type: 'image',
          thumbnail: 'https://cdn.bsky.app/thumb.jpg',
          fullsize: 'https://cdn.bsky.app/full.jpg',
          alt: 'Robot',
        },
      ],
    },
    {
      platform: 'reddit',
      externalId: 'game',
      url: 'https://reddit.com/r/games/comments/game',
      author: 'Studio',
      authorUrl: 'https://reddit.com/u/studio',
      publishedAt: candidates[0].publishedAt,
      observedAt: candidates[0].publishedAt,
      text: texts[2],
      title: 'Game release',
      subreddit: 'games',
      metrics: { score: 100, comments: 5, upvoteRatio: 0.9 },
      thumbnail: null,
      externalUrl: null,
      reasons: ['Qualified Reddit'],
    },
  ];
  const ids = ['one', 'bluesky:robot', 'reddit:game'];
  const picks = ids.map((id) => ({
    id,
    whyItMatters: '',
    rationale: 'A concrete release.',
  }));
  const h = harness([
    {
      posts: picks,
      qualifiedAlternatives: [],
      eventAnnotations: [
        ...ids.map((id, index) => ({
          id,
          event: ['launch', 'robot', 'game'][index],
          eventEvidence: texts[index],
          materialFacts: [],
        })),
        {
          id: 'story1',
          event: 'launch',
          eventEvidence: 'Model launch',
          materialFacts: [],
        },
      ],
    },
  ]);
  const input = {
    topic,
    budget: 3,
    runId: 'joint',
    stories: [{ title: 'Model launch', summary: texts[0] }],
    candidates: snapshots.map((snapshot, index) => ({
      snapshot,
      editorial: {
        ...candidates[0],
        id: ids[index],
        platform: snapshot.platform,
        text: snapshot.text,
        author: snapshot.author,
      },
    })),
  };
  const run = () => previewJointEventSelection(h.editor, input);
  const result = await run();
  assert.equal(result.status, 'complete');
  assert.deepEqual(
    result.posts.map(({ platform }) => platform),
    ['x', 'bluesky', 'reddit'],
  );
  assert.deepEqual(
    result.eventBudgetPreview?.map(({ platform }) => platform),
    ['bluesky', 'reddit'],
  );
  assert.deepEqual(result.eventBudgetPreview?.[0], {
    ...snapshots[1],
    whyItMatters: '',
    reasons: ['Qualified Bluesky', 'Editor: A concrete release.'],
  });
  assert.deepEqual(
    result.eventBudgetPreview?.[1].metrics,
    snapshots[2].metrics,
  );
  assert.deepEqual(await run(), result);
  assert.equal(h.calls.length, 1);
  assert.deepEqual(snapshots[1].reasons, ['Qualified Bluesky']);
  await assert.rejects(() =>
    previewJointEventSelection(h.editor, {
      ...input,
      candidates: input.candidates.map((candidate, index) =>
        index
          ? candidate
          : {
              ...candidate,
              editorial: { ...candidate.editorial, text: 'Different evidence' },
            },
      ),
    }),
  );
  assert.equal(h.calls.length, 1);
});

void test('joint platform preview refuses X-displacing plans and unavailable outcomes without fallback calls', async () => {
  const snapshot = (externalId: string) => ({
    platform: 'x' as const,
    externalId,
    text: candidates[0].text,
    author: candidates[0].author,
    publishedAt: candidates[0].publishedAt,
    url: `https://x.com/lab/status/${externalId}`,
    authorUrl: 'https://x.com/lab',
    metrics: {},
    reasons: [],
  });
  const first = snapshot('one');
  const blue: SelectedSocialPost = {
    ...snapshot('blue'),
    platform: 'bluesky',
    url: 'https://bsky.app/profile/lab/post/blue',
    observedAt: first.publishedAt,
    metrics: { likes: 1, replies: 0, reposts: 0 },
  };
  const input = {
    topic,
    budget: 1,
    runId: 'preference',
    stories: [],
    candidates: [first, blue].map((snapshot) => ({
      snapshot,
      editorial: {
        ...candidates[0],
        id:
          snapshot.platform === 'x'
            ? snapshot.externalId
            : `bluesky:${snapshot.externalId}`,
        platform: snapshot.platform,
      },
    })),
  };
  let calls = 0;
  const editor = {
    async edit() {
      throw new Error('Unexpected fallback');
    },
    async editOutcome() {
      calls++;
      return {
        status: 'complete' as const,
        value: {
          model: 'fake',
          posts: [post],
          eventBudgetPreview: [{ ...post, id: 'bluesky:blue' }],
        },
      };
    },
  };
  const result = await previewJointEventSelection(editor, input);
  assert.equal(result.posts[0].platform, 'x');
  assert.equal(result.eventBudgetPreview, null);
  assert.equal(calls, 1);
  const unavailable = await previewJointEventSelection(
    {
      ...editor,
      async editOutcome() {
        calls++;
        return { status: 'failed' as const, failures: ['Budget unavailable'] };
      },
    },
    input,
  );
  assert.equal(unavailable.eventBudgetPreview, null);
  assert.equal(calls, 2);
  const empty = await previewJointEventSelection(editor, {
    ...input,
    budget: 0,
  });
  assert.deepEqual(empty.eventBudgetPreview, []);
  assert.equal(calls, 2);
});

void test('joint editor searches inside the X reservation on fresh and cached annotations', async () => {
  const pool = [
    { id: 'x1', platform: 'x' as const, event: 'launch' },
    { id: 'x2', platform: 'x' as const, event: 'launch' },
    { id: 'reddit', platform: 'reddit' as const, event: 'contract' },
    { id: 'blue', platform: 'bluesky' as const, event: 'game' },
    { id: 'x3', platform: 'x' as const, event: 'outage' },
  ].map((item) => ({
    ...candidates[0],
    ...item,
    text: `${item.event} announced today.`,
  }));
  const pick = (id: string) => ({
    id,
    whyItMatters: '',
    rationale: 'Concrete announcement.',
  });
  const h = harness([
    {
      posts: [pick('x1'), pick('x2')],
      qualifiedAlternatives: [pick('reddit'), pick('blue'), pick('x3')],
      eventAnnotations: [
        ...pool.map((item) => ({
          id: item.id,
          event: item.event,
          eventEvidence: item.text,
          materialFacts: [],
        })),
        ...['story1', 'story2'].map((id) => ({
          id,
          event: 'launch',
          eventEvidence: 'launch',
          materialFacts: [],
        })),
      ],
    },
  ]);
  const run = () =>
    h.editor.editOutcome(
      topic,
      pool,
      2,
      'quota',
      [],
      [
        { title: 'launch', summary: 'launch announced today.' },
        { title: 'launch', summary: 'launch announced today.' },
      ],
      { reviewEvents: true, completeStoryEvidence: true },
    );
  const fresh = await run();
  assert.equal(fresh.status, 'complete');
  if (fresh.status !== 'complete') throw new Error('Expected completed review');
  assert.deepEqual(
    fresh.value.posts.map(({ id }) => id),
    ['x1', 'x2'],
  );
  assert.deepEqual(
    fresh.value.eventBudgetPreview?.map(({ id }) => id),
    ['x3'],
  );
  assert.deepEqual(await run(), fresh);
  assert.equal(h.calls.length, 1);
});

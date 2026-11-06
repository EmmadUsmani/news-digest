import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  digestPreviewSchema,
  type SelectedSocialPost,
} from '@digest/contracts';

import {
  blueskyEditionsEnabled,
  prepareBlueskyEditionPosts,
  selectEditionBlueskyPosts,
} from '../src/modules/social/public/bluesky-edition';
import type { SocialSelectionServices } from '../src/modules/social/public/editorial-selection';

const start = new Date('2026-11-02T12:00:00Z');
const end = new Date('2026-11-03T12:00:00Z');
const observation = {
  platform: 'bluesky' as const,
  externalId: 'at://did:plc:test/app.bsky.feed.post/demo',
  url: 'https://bsky.app/profile/dev.bsky.social/post/demo',
  author: 'dev.bsky.social',
  text: 'Playable demo with original footage',
  publishedAt: '2026-11-03T11:00:00Z',
  observedAt: end.toISOString(),
  metrics: { likes: 50, reposts: 10, replies: 2 },
  media: [
    {
      type: 'image' as const,
      thumbnail: 'https://cdn.bsky.app/thumb.jpg',
      fullsize: 'https://cdn.bsky.app/full.jpg',
      alt: 'Demo',
    },
  ],
};
const xPost: SelectedSocialPost = {
  platform: 'x',
  externalId: '123',
  url: 'https://x.com/dev/status/123',
  author: 'dev',
  authorUrl: 'https://x.com/dev',
  text: 'Original X pick',
  publishedAt: observation.publishedAt,
  metrics: {},
  reasons: ['fixture'],
};
function harness() {
  const calls: string[] = [];
  const repository = {
    observations: async (id: string, from: Date, to: Date, cutoff: Date) => {
      calls.push('read');
      assert.equal(id, 'games');
      assert.equal(from, start);
      assert.equal(to, end);
      assert.equal(cutoff, end);
      return [
        observation,
        {
          ...observation,
          externalId: 'unsafe',
          url: 'http://unsafe.example/post',
        },
      ];
    },
  };
  const services: SocialSelectionServices = {
    socialTriage: {
      score: async (_topic, candidates) => {
        calls.push('triage');
        assert.equal(candidates.length, 1);
        return {
          scores: candidates.map((c) => ({
            id: c.id,
            relevance: 9,
            importance: 8,
            event: 'demo',
            rationale: 'fixture',
          })),
          unscoredIds: [],
        };
      },
    },
    socialEditor: {
      edit: async (_topic, candidates, budget, _runId, alreadySelected) => {
        calls.push('edit');
        assert.deepEqual(alreadySelected, [
          { platform: 'x', text: xPost.text, author: xPost.author },
        ]);
        assert.equal(budget, 1);
        return {
          model: 'fake',
          posts: [
            {
              id: candidates[0].id,
              whyItMatters: 'A playable demo.',
              rationale: 'Original footage.',
            },
          ],
        };
      },
    },
  };
  const input = {
    topic: { id: 'games', name: 'Gaming', description: '', guidance: '' },
    policy: { includeAny: [], excludeAny: [] },
    start,
    end,
    budget: 2,
    selectedPosts: [xPost],
    runId: 'fake',
  };
  return { calls, repository, services, input };
}
void test('Bluesky edition preparation defaults off and full slots perform no I/O', async () => {
  const h = harness();
  for (const extra of [
    {},
    { enabled: false },
    { enabled: true, budget: 1 },
    { enabled: true, budget: 0 },
  ]) {
    const result = await prepareBlueskyEditionPosts(h.repository, h.services, {
      ...h.input,
      ...extra,
    });
    assert.deepEqual(result.posts, [xPost]);
  }
  assert.deepEqual(h.calls, []);
});
void test('explicit preparation keeps X picks and freezes validated Bluesky evidence within remaining slots', async () => {
  const h = harness();
  const result = await prepareBlueskyEditionPosts(h.repository, h.services, {
    ...h.input,
    enabled: true,
  });
  assert.deepEqual(h.calls, ['read', 'triage', 'edit']);
  assert.equal(result.status, 'complete');
  assert.equal(result.model, 'fake');
  const savedEvidenceSchema =
    digestPreviewSchema.shape.topics.element.shape.blueskySelection;
  assert.deepEqual(
    savedEvidenceSchema.parse(JSON.parse(JSON.stringify(result.evidence))),
    result.evidence,
  );
  assert.equal(savedEvidenceSchema.parse(undefined), undefined);
  assert.deepEqual(result.evidence, {
    openSlots: 1,
    candidatesRead: 2,
    candidatesShortlisted: 1,
    postsPicked: 1,
    result: 'picks-made',
  });
  assert.deepEqual(result.posts[0], xPost);
  const added = result.posts[1];
  assert.equal(added.platform, 'bluesky');
  if (added.platform !== 'bluesky') return;
  assert.deepEqual(added.metrics, observation.metrics);
  assert.deepEqual(added.media, observation.media);
  assert.equal(added.displayText, observation.text);
  assert.equal(added.observedAt, observation.observedAt);
  assert.equal(added.whyItMatters, 'A playable demo.');
  assert.ok(added.reasons.includes('Editor: Original footage.'));
  added.metrics.likes = 0;
  added.media[0].alt = 'changed';
  result.posts[0].text = 'changed';
  assert.equal(observation.metrics.likes, 50);
  assert.equal(observation.media[0].alt, 'Demo');
  assert.equal(xPost.text, 'Original X pick');
});
void test('editor refusal preserves existing picks without lexical Bluesky fallback', async () => {
  const h = harness();
  h.services.socialEditor.edit = async () => null;
  const result = await prepareBlueskyEditionPosts(h.repository, h.services, {
    ...h.input,
    enabled: true,
  });
  assert.equal(result.status, 'unavailable');
  assert.equal(result.evidence.result, 'ai-unavailable');
  assert.equal(result.evidence.candidatesShortlisted, 1);
  assert.deepEqual(result.posts, [xPost]);
});
void test('explicit preparation rejects invalid budgets/windows before reading observations', async () => {
  const h = harness();
  for (const extra of [
    { budget: 21 },
    { budget: -1 },
    { budget: 1.5 },
    { end: start },
  ])
    await assert.rejects(
      prepareBlueskyEditionPosts(h.repository, h.services, {
        ...h.input,
        enabled: true,
        ...extra,
      }),
    );
  assert.deepEqual(h.calls, []);
});
void test('incomplete triage and duplicate final selections preserve existing picks', async () => {
  for (const failure of ['triage', 'editor']) {
    const h = harness();
    if (failure === 'triage')
      h.services.socialTriage.score = async () => ({
        scores: [],
        unscoredIds: ['missing'],
      });
    else
      h.services.socialEditor.edit = async (_topic, candidates) => ({
        model: 'fake',
        posts: Array.from({ length: 2 }, () => ({
          id: candidates[0].id,
          whyItMatters: 'fixture',
          rationale: 'fixture',
        })),
      });
    const result = await prepareBlueskyEditionPosts(h.repository, h.services, {
      ...h.input,
      enabled: true,
    });
    assert.equal(result.status, 'incomplete');
    assert.deepEqual(result.posts, [xPost]);
  }
});

void test('publisher off switch prevents storage and AI work', async () => {
  const previous = process.env.BLUESKY_EDITIONS_ENABLED;
  try {
    for (const value of ['', '0', 'true', 'yes', ' 1']) {
      process.env.BLUESKY_EDITIONS_ENABLED = value;
      assert.equal(blueskyEditionsEnabled(), false);
      const h = harness();
      const db = {
        query: async () => {
          assert.fail('Disabled edition queried Bluesky');
        },
      };
      const result = await selectEditionBlueskyPosts(db, h.services, h.input);
      assert.deepEqual(result.posts, [xPost]);
      assert.deepEqual(h.calls, []);
    }
    delete process.env.BLUESKY_EDITIONS_ENABLED;
    assert.equal(blueskyEditionsEnabled(), true);
  } finally {
    if (previous === undefined) delete process.env.BLUESKY_EDITIONS_ENABLED;
    else process.env.BLUESKY_EDITIONS_ENABLED = previous;
  }
});
void test('default publisher reads using its transaction and preserves primary picks', async () => {
  const previous = process.env.BLUESKY_EDITIONS_ENABLED;
  try {
    delete process.env.BLUESKY_EDITIONS_ENABLED;
    assert.equal(blueskyEditionsEnabled('1'), true);
    const h = harness();
    const unavailable = await selectEditionBlueskyPosts(
      {
        query: async () => {
          assert.fail('No AI services must not read');
        },
      },
      null,
      h.input,
    );
    assert.equal(unavailable.status, 'unavailable');
    assert.deepEqual(unavailable.posts, [xPost]);
    const db = {
      query: async (config: { rowMode: string }, args: unknown[]) => {
        assert.equal(config.rowMode, 'array');
        assert.deepEqual(args, [
          'games',
          true,
          start.toISOString(),
          end.toISOString(),
          end.toISOString(),
          5000,
        ]);
        h.calls.push('transaction-read');
        return { rows: [[observation]] };
      },
    };
    const result = await selectEditionBlueskyPosts(
      db as unknown as Parameters<typeof selectEditionBlueskyPosts>[0],
      h.services,
      h.input,
    );
    assert.deepEqual(h.calls, ['transaction-read', 'triage', 'edit']);
    assert.equal(result.posts.length, 2);
    assert.deepEqual(result.posts[0], xPost);
    assert.equal(result.posts[1].platform, 'bluesky');
  } finally {
    if (previous === undefined) delete process.env.BLUESKY_EDITIONS_ENABLED;
    else process.env.BLUESKY_EDITIONS_ENABLED = previous;
  }
});

void test('saved evidence separates no slot, no candidates, triage rejection and deliberate editor omission', async () => {
  const h = harness();
  const run = () =>
    prepareBlueskyEditionPosts(h.repository, h.services, {
      ...h.input,
      enabled: true,
    });
  const full = await prepareBlueskyEditionPosts(h.repository, h.services, {
    ...h.input,
    enabled: true,
    budget: 1,
  });
  assert.equal(full.evidence.result, 'no-slot');
  assert.equal(full.evidence.openSlots, 0);
  h.services.socialEditor.edit = async () => ({ model: 'fake', posts: [] });
  assert.equal((await run()).evidence.result, 'editor-chose-none');
  h.services.socialTriage.score = async (_topic, candidates) => ({
    scores: candidates.map((c) => ({
      id: c.id,
      relevance: 1,
      importance: 1,
      event: '',
      rationale: '',
    })),
    unscoredIds: [],
  });
  assert.equal((await run()).evidence.result, 'nothing-passed-triage');
  h.repository.observations = async () => [];
  const empty = await run();
  assert.equal(empty.evidence.result, 'no-candidates');
  assert.equal(empty.evidence.candidatesRead, 0);
});

void test('saved Bluesky outcomes distinguish exact refusals, mixed failures and unknown evidence', async () => {
  for (const [failures, expected] of [
    [['budget-refused', 'budget-refused'], 'budget-refused'],
    [['provider-spend-limit'], 'budget-refused'],
    [['validation-failed', 'budget-refused'], 'ai-editing-failed'],
    [['provider-call-failed'], 'ai-editing-failed'],
    [['unavailable'], 'ai-unavailable'],
  ] as const) {
    const h = harness();
    h.services.socialEditor.edit = async () => {
      throw new Error('nullable fallback must not run twice');
    };
    h.services.socialEditor.editOutcome = async () => ({
      status: 'failed',
      failures: [...failures],
    });
    const result = await prepareBlueskyEditionPosts(h.repository, h.services, {
      ...h.input,
      enabled: true,
    });
    assert.equal(result.evidence.result, expected);
    assert.deepEqual(result.posts, [xPost]);
    const schema =
      digestPreviewSchema.shape.topics.element.shape.blueskySelection;
    assert.deepEqual(
      schema.parse(JSON.parse(JSON.stringify(result.evidence))),
      result.evidence,
    );
  }
  const h = harness();
  h.services.socialTriage.score = async (_topic, candidates) => ({
    scores: [],
    unscoredIds: candidates.map((c) => c.id),
    failures: ['budget-refused'],
  });
  const result = await prepareBlueskyEditionPosts(h.repository, h.services, {
    ...h.input,
    enabled: true,
  });
  assert.equal(result.evidence.result, 'budget-refused');
  assert.equal(result.evidence.candidatesShortlisted, 0);
  assert.deepEqual(h.calls, ['read']);
});

void test('Bluesky dropped-post categories survive successful and failed saved outcomes', async () => {
  const droppedPosts = {
    invalidFields: 1,
    unknownId: 2,
    repeatedId: 3,
    unsupportedClaim: 4,
    overBudget: 5,
  };
  for (const failed of [false, true]) {
    const h = harness();
    const edit = h.services.socialEditor.edit.bind(h.services.socialEditor);
    h.services.socialEditor.editOutcome = async (...args) =>
      failed
        ? { status: 'failed', failures: ['validation-failed'], droppedPosts }
        : {
            status: 'complete',
            value: { ...(await edit(...args))!, droppedPosts },
          };
    const result = await prepareBlueskyEditionPosts(h.repository, h.services, {
      ...h.input,
      enabled: true,
    });
    assert.equal(
      result.evidence.result,
      failed ? 'ai-editing-failed' : 'picks-made',
    );
    const saved =
      digestPreviewSchema.shape.topics.element.shape.blueskySelection.parse(
        JSON.parse(JSON.stringify(result.evidence)),
      );
    assert.deepEqual(saved?.droppedPosts, droppedPosts);
  }
});

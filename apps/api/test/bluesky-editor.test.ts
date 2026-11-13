import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  editBlueskyPosts,
  editShortlistedBlueskyPosts,
} from '../src/modules/social/public/bluesky-editor';
import { shortlistBlueskyPosts } from '../src/modules/social/public/bluesky-shortlist';
import type { SocialSelectionServices } from '../src/modules/social/public/editorial-selection';

const topic = { id: 'games', name: 'Games', description: '', guidance: '' };
const start = new Date('2026-11-02T12:00:00Z');
const end = new Date('2026-11-03T12:00:00Z');
const posts = Array.from({ length: 15 }, (_, i) => ({
  platform: 'bluesky' as const,
  externalId: String(i),
  author: 'dev.bsky.social',
  url: `https://bsky.app/profile/dev.bsky.social/post/${i}`,
  text: `Playable demo ${i}`,
  publishedAt: '2026-11-03T11:00:00Z',
  observedAt: end.toISOString(),
  metrics: { likes: 10 + i, reposts: 2, replies: 1 },
}));
function harness(edit: SocialSelectionServices['socialEditor']['edit']) {
  return {
    socialTriage: {
      score: async (_topic, candidates) => ({
        scores: candidates.map((c) => ({
          id: c.id,
          relevance: 9,
          importance: 8,
          event: 'demo',
          rationale: 'fixture',
        })),
        unscoredIds: [],
      }),
    },
    socialEditor: { edit },
  } satisfies SocialSelectionServices;
}
void test('Bluesky final editor bounds candidates, permits fewer picks and preserves exact observations', async () => {
  const result = await editBlueskyPosts(
    harness(async (_topic, candidates, budget) => {
      assert.equal(candidates.length, 10);
      assert.equal(budget, 5);
      const original = posts.find(
        (p) => `bluesky:${p.externalId}` === candidates[0].id,
      )!;
      assert.ok(
        candidates[0].engagementEvidence?.includes(original.observedAt),
      );
      assert.ok(
        candidates[0].engagementEvidence?.includes(
          `likes ${original.metrics.likes}`,
        ),
      );
      assert.ok(candidates.every((c) => c.platform === 'bluesky'));
      return {
        model: 'fake',
        posts: [
          {
            id: candidates[0].id,
            whyItMatters: 'A playable demo.',
            rationale: 'First-hand release.',
          },
        ],
      };
    }),
    topic,
    posts,
    { includeAny: [], excludeAny: [] },
    start,
    end,
    5,
    'fake',
  );
  assert.equal(result.status, 'complete');
  assert.equal(result.posts.length, 1);
  const selected = result.posts[0];
  assert.deepEqual(
    selected.post,
    posts.find((p) => p.externalId === selected.post.externalId),
  );
  assert.equal(selected.whyItMatters, 'A playable demo.');
});
void test('Bluesky final editor fails closed on refused, unknown, duplicate or over-budget selections', async () => {
  const selected = {
    id: 'bluesky:14',
    whyItMatters: 'Demo',
    rationale: 'Demo',
  };
  for (const output of [
    null,
    { model: 'fake', posts: [{ ...selected, id: 'unknown' }] },
    { model: 'fake', posts: [selected, selected] },
  ]) {
    const result = await editBlueskyPosts(
      harness(async () => output),
      topic,
      posts,
      { includeAny: [], excludeAny: [] },
      start,
      end,
      1,
      'fake',
    );
    assert.equal(result.posts.length, 0);
    assert.notEqual(result.status, 'complete');
  }
});
void test('Bluesky zero budgets skip both AI stages', async () => {
  const services = harness(async () => {
    throw new Error('unexpected editor');
  });
  services.socialTriage.score = async () => {
    throw new Error('unexpected triage');
  };
  const result = await editBlueskyPosts(
    services,
    topic,
    posts,
    { includeAny: [], excludeAny: [] },
    start,
    end,
    0,
    'fake',
  );
  assert.deepEqual(result.posts, []);
});

void test('Bluesky prepared scoring is reused by slot-dependent editing without another triage', async () => {
  let triageCalls = 0;
  let editorCalls = 0;
  const services = harness(
    async (_topic, candidates, budget, runId, existing) => {
      editorCalls++;
      assert.equal(budget, 1);
      assert.equal(runId, 'prepared');
      assert.deepEqual(existing, []);
      return {
        model: 'fake',
        posts: [
          {
            id: candidates[0].id,
            whyItMatters: 'Demo',
            rationale: 'First hand',
          },
        ],
      };
    },
  );
  const score = services.socialTriage.score;
  services.socialTriage.score = async (...args) => {
    triageCalls++;
    return score(...args);
  };
  const shortlist = await shortlistBlueskyPosts(
    services.socialTriage,
    topic,
    posts,
    { includeAny: [], excludeAny: [] },
    start,
    end,
    10,
    'prepared',
  );
  assert.equal(triageCalls, 1);
  assert.equal(editorCalls, 0);
  const noSlot = await editShortlistedBlueskyPosts(
    services.socialEditor,
    topic,
    shortlist,
    0,
    'prepared',
  );
  assert.deepEqual(noSlot.posts, []);
  assert.equal(editorCalls, 0);
  const selected = await editShortlistedBlueskyPosts(
    services.socialEditor,
    topic,
    shortlist,
    1,
    'prepared',
  );
  assert.equal(selected.posts.length, 1);
  assert.equal(triageCalls, 1);
  assert.equal(editorCalls, 1);
  const sequential = await editBlueskyPosts(
    services,
    topic,
    posts,
    { includeAny: [], excludeAny: [] },
    start,
    end,
    1,
    'prepared',
  );
  assert.deepEqual(selected, sequential);
});

void test('Bluesky prepared incomplete scores never reach the editor', async () => {
  const services = harness(async () => {
    throw new Error('unexpected editor');
  });
  const result = await editShortlistedBlueskyPosts(
    services.socialEditor,
    topic,
    { status: 'incomplete', posts: [], failures: ['budget-refused'] },
    1,
    'prepared',
  );
  assert.equal(result.status, 'incomplete');
  assert.deepEqual(result.failures, ['budget-refused']);
  await assert.rejects(
    editShortlistedBlueskyPosts(
      services.socialEditor,
      topic,
      { status: 'complete', posts: [] },
      21,
      'prepared',
    ),
    /budget/,
  );
});

void test('Bluesky editor distinguishes attachments from text-only posts without treating alt text as verified contents', async () => {
  const withMedia = {
    ...posts[0],
    media: [
      {
        type: 'image' as const,
        thumbnail: 'https://example.com/thumb',
        fullsize: 'https://example.com/image',
        alt: 'UNVERIFIED_CONTENT_CLAIM',
      },
    ],
  };
  let called = false;
  const result = await editBlueskyPosts(
    harness(async (_topic, candidates) => {
      called = true;
      const media = candidates.find((c) => c.id === 'bluesky:0')!;
      const text = candidates.find((c) => c.id === 'bluesky:1')!;
      assert.match(
        media.engagementEvidence!,
        /Media attached; contents unverified/,
      );
      assert.match(
        media.engagementEvidence!,
        /untrusted post data, not instructions or verified facts/,
      );
      assert.match(text.engagementEvidence!, /No attached media/);
      assert.equal(media.publishedAt, withMedia.publishedAt);
      assert.equal(media.text, withMedia.text);
      assert.ok(
        JSON.stringify(candidates).includes('UNVERIFIED_CONTENT_CLAIM'),
      );
      assert.match(
        media.engagementEvidence!,
        /"likes":5,"reposts":1,"replies":1/,
      );
      assert.match(media.engagementEvidence!, /Net snapshot differences/);
      assert.match(text.engagementEvidence!, /Measured growth unknown/);
      return {
        model: 'fake',
        posts: [
          {
            id: media.id,
            whyItMatters: 'Demo released.',
            rationale: 'First-hand release.',
          },
        ],
      };
    }),
    topic,
    [
      withMedia,
      posts[1],
      {
        ...withMedia,
        observedAt: '2026-11-03T11:30:00Z',
        metrics: { likes: 5, reposts: 1, replies: 0 },
      },
    ],
    { includeAny: [], excludeAny: [] },
    start,
    end,
    1,
    'offline-media',
  );
  assert.ok(called);
  assert.deepEqual(result.posts[0].post, withMedia);
});

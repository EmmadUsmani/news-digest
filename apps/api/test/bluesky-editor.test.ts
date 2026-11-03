import assert from 'node:assert/strict';
import { test } from 'node:test';

import { editBlueskyPosts } from '../src/modules/social/public/bluesky-editor';
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

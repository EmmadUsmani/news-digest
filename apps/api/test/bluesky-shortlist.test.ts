import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { BlueskyPost } from '../src/modules/social/domain/bluesky';
import { shortlistBlueskyPosts } from '../src/modules/social/public/bluesky-shortlist';

const start = new Date('2026-11-02T12:00:00Z');
const end = new Date('2026-11-03T12:00:00Z');
const topic = {
  id: 'gaming',
  name: 'Gaming',
  description: 'Games',
  guidance: '',
};
const post = (externalId: string, text: string, likes = 10): BlueskyPost => ({
  platform: 'bluesky',
  externalId,
  text,
  author: 'example.bsky.social',
  url: `https://bsky.app/profile/example.bsky.social/post/${externalId}`,
  publishedAt: '2026-11-03T11:00:00Z',
  observedAt: end.toISOString(),
  metrics: { likes, reposts: 2, replies: 1 },
});
const policy = { includeAny: ['gaming'], excludeAny: ['sponsored'] };
const inputs = [
  post('demo', 'Playable prototype released today'),
  post('popular', 'Football score', 100000),
  post('spam', 'crypto gaming'),
  post('ad', 'sponsored demo'),
];

void test('Bluesky semantic shortlist recovers phrase misses and rejects popular irrelevant posts before ranking', async () => {
  const result = await shortlistBlueskyPosts(
    {
      score: async (_topic, candidates) => {
        assert.deepEqual(candidates.map((c) => c.id).sort(), [
          'bluesky:demo',
          'bluesky:popular',
        ]);
        return {
          scores: candidates.map((c) => ({
            id: c.id,
            relevance: c.id === 'bluesky:demo' ? 9 : 1,
            importance: 8,
            event: 'prototype',
            rationale: 'fixture score',
          })),
          unscoredIds: [],
        };
      },
    },
    topic,
    inputs,
    policy,
    start,
    end,
    5,
    'fake-run',
  );
  assert.equal(result.status, 'complete');
  assert.deepEqual(
    result.posts.map((p) => p.post.externalId),
    ['demo'],
  );
  assert.equal(result.posts[0].post.text, inputs[0].text);
  assert.match(result.posts[0].reasons.join(' '), /not measured growth/);
});

void test('Bluesky shortlist fails closed on incomplete, duplicated, unknown or invalid semantic scores', async () => {
  const score = {
    id: 'bluesky:demo',
    relevance: 9,
    importance: 8,
    event: 'demo',
    rationale: 'fixture',
  };
  for (const scores of [
    [],
    [score, score],
    [{ ...score, id: 'unknown' }],
    [{ ...score, relevance: NaN }],
  ]) {
    const result = await shortlistBlueskyPosts(
      { score: async () => ({ scores, unscoredIds: [] }) },
      topic,
      inputs.slice(0, 1),
      policy,
      start,
      end,
      5,
      'fake',
    );
    assert.equal(result.status, 'incomplete');
    assert.deepEqual(result.posts, []);
  }
  const result = await shortlistBlueskyPosts(
    { score: async () => ({ scores: [score], unscoredIds: [score.id] }) },
    topic,
    inputs.slice(0, 1),
    policy,
    start,
    end,
    5,
    'fake',
  );
  assert.equal(result.status, 'incomplete');
});

void test('Bluesky shortlist bounds triage and skips I/O for zero budgets or unsafe inputs', async () => {
  let calls = 0;
  const triage = {
    score: async (_topic: unknown, candidates: { id: string }[]) => {
      calls++;
      assert.equal(candidates.length, 50);
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
  };
  const many = Array.from({ length: 60 }, (_, i) =>
    post(String(i), 'prototype', i),
  );
  const result = await shortlistBlueskyPosts(
    triage,
    topic,
    many,
    policy,
    start,
    end,
    5,
    'fake',
  );
  assert.equal(result.posts.length, 5);
  await shortlistBlueskyPosts(
    triage,
    topic,
    many,
    policy,
    start,
    end,
    0,
    'fake',
  );
  await shortlistBlueskyPosts(
    triage,
    topic,
    [inputs[2]],
    policy,
    start,
    end,
    5,
    'fake',
  );
  await assert.rejects(
    shortlistBlueskyPosts(triage, topic, many, policy, start, end, 21, 'fake'),
  );
  assert.equal(calls, 1);
});

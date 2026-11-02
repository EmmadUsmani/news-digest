import assert from 'node:assert/strict';
import { test } from 'node:test';

import { shortlistReddit } from '../src/modules/social/application/shortlist-reddit';
import {
  rankRedditPosts,
  type RedditObservation,
} from '../src/modules/social/domain/reddit-ranking';

const start = new Date('2026-11-02T00:00:00Z');
const end = new Date('2026-11-03T00:00:00Z');
const policy = { includeAny: ['NBA'], excludeAny: ['spoiler'] };
function entry(id: string, baseline = false, score = 100): RedditObservation {
  return {
    observedAt: baseline ? '2026-11-01T12:00:00Z' : '2026-11-02T12:00:00Z',
    citesX: false,
    post: {
      platform: 'reddit',
      externalId: id,
      url: `https://www.reddit.com/comments/${id}`,
      title: 'NBA highlight',
      text: '',
      author: 'fan',
      authorUrl: 'https://www.reddit.com/user/fan',
      publishedAt: baseline ? '2026-11-01T02:00:00Z' : '2026-11-02T02:00:00Z',
      subreddit: 'nba',
      metrics: { score, comments: 10, upvoteRatio: 0.95 },
      thumbnail: null,
      externalUrl: null,
    },
  };
}
const baseline = Array.from({ length: 5 }, (_, i) =>
  entry(`base${i}`, true, 20),
);
void test('Reddit ranks relative strength, not raw cross-community score, with deterministic bounded picks', () => {
  const huge = baseline.map((b, i) => ({
    ...b,
    post: {
      ...b.post,
      externalId: `big${i}`,
      subreddit: 'large',
      metrics: { ...b.post.metrics, score: 1000 },
    },
  }));
  const raw = entry('raw', false, 1500);
  raw.post.subreddit = 'large';
  const ranked = rankRedditPosts(
    [...baseline, ...huge, raw, entry('winner'), entry('runner', false, 80)],
    policy,
    start,
    end,
    1,
  );
  assert.deepEqual(
    ranked.map((r) => r.post.externalId),
    ['winner'],
  );
  assert.match(ranked[0].reasons.join(' '), /proxy/);
  assert.deepEqual(
    rankRedditPosts([...baseline, entry('a')], policy, start, end, 0),
    [],
  );
});
void test('Reddit withholds sparse, weak, unsafe, future, duplicate and X-wrapper evidence', () => {
  const pick = entry('pick');
  const run = (rows: RedditObservation[]) =>
    rankRedditPosts(rows, policy, start, end, 5);
  assert.equal(run([...baseline.slice(1), pick]).length, 0);
  assert.equal(run([...baseline, ...baseline, pick]).length, 1);
  for (const mutate of [
    (p: RedditObservation) => {
      p.citesX = true;
    },
    (p: RedditObservation) => {
      p.post.metrics.score = 30;
    },
    (p: RedditObservation) => {
      p.post.metrics.upvoteRatio = 0.5;
    },
    (p: RedditObservation) => {
      p.post.metrics.score = NaN;
    },
    (p: RedditObservation) => {
      p.observedAt = end.toISOString();
    },
    (p: RedditObservation) => {
      p.observedAt = p.post.publishedAt.replace('02:00', '01:00');
    },
    (p: RedditObservation) => {
      p.post.title = 'NBA spoiler';
    },
    (p: RedditObservation) => {
      p.post.title = 'Unrelated';
    },
    (p: RedditObservation) => {
      p.post.publishedAt = end.toISOString();
    },
  ]) {
    const changed = structuredClone(pick);
    mutate(changed);
    assert.equal(run([...baseline, changed]).length, 0);
  }
  const futureBaseline = baseline.map((b) => ({
    ...b,
    observedAt: end.toISOString(),
  }));
  assert.equal(run([...futureBaseline, pick]).length, 0);
  assert.throws(() => rankRedditPosts([], policy, end, start, 5), /window/);
});

void test('Reddit application shortlist reads through the repository port and skips empty budgets', async () => {
  const calls: unknown[][] = [];
  const repository = {
    observations: async (...args: [string, Date, Date]) => {
      calls.push(args);
      return [...baseline, entry('winner')];
    },
  };
  assert.equal(
    (await shortlistReddit(repository, 'topic', policy, start, end, 2))[0].post
      .externalId,
    'winner',
  );
  assert.deepEqual(calls, [['topic', start, end]]);
  assert.deepEqual(
    await shortlistReddit(repository, 'topic', policy, start, end, 0),
    [],
  );
  assert.equal(calls.length, 1);
});

void test('Reddit snapshots retain faithful card fields and immutable observed evidence', async () => {
  const { snapshotRedditPost } =
    await import('../src/modules/social/public/reddit-snapshot');
  const candidate = entry('snapshot');
  candidate.post.text = 'A full description';
  candidate.post.thumbnail = 'https://preview.redd.it/fixture.jpg';
  candidate.post.externalUrl = 'https://example.org/highlight';
  const ranked = rankRedditPosts(
    [...baseline, candidate],
    policy,
    start,
    end,
    5,
  )[0];
  const snapshot = snapshotRedditPost(ranked);
  assert.equal(snapshot.title, 'NBA highlight');
  assert.equal(snapshot.text, 'NBA highlight\nA full description');
  assert.equal(snapshot.displayText, 'A full description');
  assert.equal(snapshot.subreddit, 'nba');
  assert.equal(snapshot.observedAt, candidate.observedAt);
  assert.equal(snapshot.thumbnail, candidate.post.thumbnail);
  assert.equal(snapshot.externalUrl, candidate.post.externalUrl);
  candidate.post.metrics.score = 999;
  ranked.reasons.push('later mutation');
  assert.equal(snapshot.metrics.score, 100);
  assert.equal(snapshot.reasons.length, 2);
  assert.throws(() => snapshotRedditPost({ ...ranked, observedAt: 'invalid' }));
  assert.throws(() =>
    snapshotRedditPost({
      ...ranked,
      post: {
        ...candidate.post,
        metrics: { ...candidate.post.metrics, comments: -1 },
      },
    }),
  );
});

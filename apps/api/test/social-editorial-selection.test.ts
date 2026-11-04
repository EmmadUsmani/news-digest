import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { SelectedPost } from '@digest/contracts';

import {
  editTopicPosts,
  type SocialSelectionServices,
} from '../src/modules/social/public/editorial-selection';

const topic = {
  id: 'topic',
  name: 'World',
  description: 'World events',
  guidance: '',
};
const posts: SelectedPost[] = Array.from({ length: 14 }, (_, i) => ({
  platform: 'x',
  externalId: String(i),
  url: `https://x.com/example/status/${i}`,
  author: 'Fixture',
  authorUrl: 'https://x.com/example',
  publishedAt: '2026-10-10T00:00:00Z',
  text: `Synthetic event ${i}`,
  metrics: {},
  reasons: ['lexical fallback'],
}));
void test('social orchestration bounds shortlist, preserves post identity and stores semantic provenance', async () => {
  const services: SocialSelectionServices = {
    socialTriage: {
      async score(_topic, candidates) {
        assert.equal(candidates.length, 14);
        return {
          scores: candidates.map((c) => ({
            id: c.id,
            relevance: 8,
            importance: 7,
            event: 'fixture',
            rationale: 'Synthetic score',
          })),
          unscoredIds: [],
        };
      },
    },
    socialEditor: {
      async edit(_topic, candidates, budget) {
        assert.equal(candidates.length, 10);
        assert.equal(budget, 2);
        return {
          model: 'fake',
          posts: [
            {
              id: candidates[0].id,
              whyItMatters: 'Synthetic context',
              rationale: 'Synthetic choice',
            },
          ],
        };
      },
    },
  };
  const result = await editTopicPosts(
    services,
    topic,
    posts,
    [posts[13]],
    2,
    'test',
  );
  assert.equal(result.postSelectionMethod, 'verified-semantic-engagement-v3');
  assert.equal(result.postEditorial.mode, 'ai');
  assert.equal(result.posts[0].text, posts[0].text);
  assert.equal(result.posts[0].whyItMatters, 'Synthetic context');
  assert.ok(!result.posts[0].reasons.includes('lexical fallback'));
  assert.equal(posts[0].whyItMatters, undefined);
});
void test('incomplete triage and exhausted editor retain lexical fallback; quiet selection stays empty', async () => {
  let editorCalls = 0;
  const services: SocialSelectionServices = {
    socialTriage: {
      async score() {
        return { scores: [], unscoredIds: ['0'] };
      },
    },
    socialEditor: {
      async edit() {
        editorCalls++;
        return null;
      },
    },
  };
  const incomplete = await editTopicPosts(
    services,
    topic,
    posts,
    [posts[0]],
    1,
    'test',
  );
  assert.equal(incomplete.postEditorial.mode, 'non-ai');
  assert.deepEqual(incomplete.posts, [posts[0]]);
  assert.equal(editorCalls, 0);
  services.socialTriage.score = async () => ({ scores: [], unscoredIds: [] });
  const unavailable = await editTopicPosts(
    services,
    topic,
    posts,
    [posts[0]],
    1,
    'test',
  );
  assert.equal(unavailable.postEditorial.mode, 'non-ai');
  services.socialEditor.edit = async () => {
    throw new Error('Empty candidate pool must not reach editor');
  };
  const quiet = await editTopicPosts(services, topic, [], [], 1, 'test');
  assert.deepEqual(quiet.posts, []);
  assert.equal(quiet.postEditorial.mode, 'non-ai');
  assert.equal(quiet.postEditorial.model, null);
  assert.match(quiet.postEditorial.reason, /No verified posts/);
  assert.match(incomplete.postEditorial.reason, /triage is incomplete/);
  assert.match(unavailable.postEditorial.reason, /editor unavailable/);
  await editTopicPosts(services, topic, posts, [], 0, 'test');
  assert.equal(editorCalls, 1);
});

void test('empty and disabled post sections skip both social AI services', async () => {
  const services: SocialSelectionServices = {
    socialTriage: {
      async score() {
        throw new Error('Unexpected triage');
      },
    },
    socialEditor: {
      async edit() {
        throw new Error('Unexpected edit');
      },
    },
  };
  for (const available of [services, null]) {
    const empty = await editTopicPosts(available, topic, [], [], 5, 'test');
    assert.equal(empty.postEditorial.mode, 'non-ai');
    assert.equal(empty.postEditorial.model, null);
    assert.deepEqual(empty.postEditorial.unscoredIds, []);
    assert.match(empty.postEditorial.reason, /no social AI calls/);
    const disabled = await editTopicPosts(
      available,
      topic,
      posts,
      [],
      0,
      'test',
    );
    assert.match(disabled.postEditorial.reason, /budget is zero/);
  }
});

void test('mixed-platform editorial isolates IDs and reserves X slots without padding', async () => {
  const { selectedPostSchema } = await import('@digest/contracts');
  type Candidate = Omit<SelectedPost, 'platform'> & {
    platform: 'x' | 'reddit';
  };
  const reddit: Candidate[] = Array.from({ length: 8 }, (_, i) => ({
    ...posts[i],
    platform: 'reddit',
    text: `Synthetic Reddit ${i}`,
    url: `https://www.reddit.com/r/test/comments/${i}/`,
  }));
  const services: SocialSelectionServices = {
    socialTriage: {
      async score(_topic, candidates) {
        assert.equal(
          new Set(candidates.map((p) => p.id)).size,
          candidates.length,
        );
        assert.ok(candidates.some((p) => p.title === 'Reddit post'));
        return {
          scores: candidates.map((p) => ({
            id: p.id,
            relevance: 8,
            importance: p.id.startsWith('reddit:') ? 10 : 7,
            event: 'fixture',
            rationale: 'Synthetic score',
          })),
          unscoredIds: [],
        };
      },
    },
    socialEditor: {
      async edit(_topic, candidates, budget) {
        assert.ok(candidates.length <= 10);
        // Deliberately prefer Reddit to exercise the enforced platform cap.
        return {
          model: 'fake',
          posts: [...candidates]
            .sort(
              (a, b) =>
                Number(b.platform === 'reddit') -
                Number(a.platform === 'reddit'),
            )
            .slice(0, budget)
            .map((p) => ({
              id: p.id,
              whyItMatters: 'Synthetic context',
              rationale: 'Synthetic choice',
            })),
        };
      },
    },
  };
  const mixed: Candidate[] = [...posts.slice(0, 5), ...reddit];
  const result = await editTopicPosts(services, topic, mixed, [], 5, 'test');
  assert.equal(result.posts.filter((p) => p.platform === 'reddit').length, 1);
  assert.equal(result.posts.length, 1, 'declined X slots must stay empty');
  assert.equal(result.posts[0].text, reddit[0].text);
  assert.ok(result.postEditorial.triage.some((p) => p.id === '0'));
  assert.ok(result.postEditorial.triage.some((p) => p.id === 'reddit:0'));
  assert.equal(
    selectedPostSchema.safeParse(result.posts[0]).success,
    false,
    'Reddit editorial preparation must not silently enter the X-only snapshot contract',
  );
  const sparse = await editTopicPosts(
    services,
    topic,
    [...posts.slice(0, 1), ...reddit],
    [],
    5,
    'test',
  );
  assert.equal(sparse.posts.length, 4, 'one qualifying X reserves one slot');
  const fallback = await editTopicPosts(
    null,
    topic,
    mixed,
    [...reddit, ...posts.slice(0, 5)],
    5,
    'test',
  );
  assert.equal(fallback.posts.filter((p) => p.platform === 'reddit').length, 1);
  assert.equal(fallback.posts.filter((p) => p.platform === 'x').length, 4);
  const redditOnly = await editTopicPosts(
    services,
    topic,
    reddit,
    [],
    5,
    'test',
  );
  assert.equal(
    redditOnly.posts.length,
    5,
    'no X evidence permits strong Reddit candidates',
  );
});

void test('reported engagement changes semantic shortlist admission without bypassing relevance or importance gates', async () => {
  const candidates = posts.map((p, i) => ({
    ...p,
    xSearchRanking: {
      bonus: i >= 10 ? 2 : 0,
      reason: 'Unverified synthetic search report',
    },
  }));
  const services: SocialSelectionServices = {
    socialTriage: {
      async score() {
        return {
          scores: candidates.map((p, i) => ({
            id: p.externalId,
            relevance: i === 12 ? 5 : 8,
            importance: i === 13 ? 3 : i >= 10 ? 6 : 7,
            event: 'fixture',
            rationale: 'Synthetic score',
          })),
          unscoredIds: [],
        };
      },
    },
    socialEditor: {
      async edit(_topic, shortlist) {
        assert.equal(shortlist.length, 10);
        assert.equal(
          shortlist[0].engagementEvidence,
          'Unverified synthetic search report',
        );
        assert.deepEqual(
          shortlist.slice(0, 2).map((p) => p.id),
          ['10', '11'],
        );
        assert.ok(!shortlist.some((p) => ['12', '13'].includes(p.id)));
        return {
          model: 'fake',
          posts: [
            {
              id: '10',
              whyItMatters: 'Synthetic context',
              rationale: 'Synthetic pick',
            },
          ],
        };
      },
    },
  };
  const result = await editTopicPosts(
    services,
    topic,
    candidates,
    [],
    1,
    'test',
  );
  assert.equal(result.posts[0].externalId, '10');
  assert.ok(
    result.posts[0].reasons.includes('Unverified synthetic search report'),
  );
  assert.deepEqual(result.posts[0].metrics, {});
  assert.equal(result.posts[0].xSearchRanking?.bonus, 2);
  const { selectedPostSchema } = await import('@digest/contracts');
  assert.equal(
    selectedPostSchema.parse(result.posts[0]).xSearchRanking?.bonus,
    2,
  );
});

void test('unavailable social editor cannot restore posts rejected by completed triage', async () => {
  const services: SocialSelectionServices = {
    socialTriage: {
      async score() {
        return {
          scores: [
            {
              id: '0',
              relevance: 5,
              importance: 9,
              event: 'fixture',
              rationale: 'Off topic',
            },
            {
              id: '1',
              relevance: 9,
              importance: 3,
              event: 'fixture',
              rationale: 'Filler',
            },
            {
              id: '2',
              relevance: 6,
              importance: 4,
              event: 'fixture',
              rationale: 'Qualifies at threshold',
            },
          ],
          unscoredIds: [],
        };
      },
    },
    socialEditor: {
      async edit(_topic, candidates) {
        assert.deepEqual(
          candidates.map((p) => p.id),
          ['2'],
        );
        return null;
      },
    },
  };
  const fallback = posts.slice(0, 4);
  const result = await editTopicPosts(
    services,
    topic,
    fallback,
    fallback,
    3,
    'test',
  );
  assert.deepEqual(result.posts, [posts[2]]);
  assert.equal(result.postEditorial.mode, 'non-ai');
  assert.equal(result.postEditorial.model, null);
  assert.equal(result.postEditorial.triage.length, 3);
  assert.match(result.postEditorial.reason, /completed semantic/);
  assert.equal(result.postSelectionMethod, 'verified-lexical-engagement-v3');
  assert.deepEqual(
    fallback,
    posts.slice(0, 4),
    'fallback input remains untouched',
  );
  const rejected = await editTopicPosts(
    services,
    topic,
    fallback,
    [posts[0], posts[1]],
    3,
    'test',
  );
  assert.deepEqual(rejected.posts, []);
});

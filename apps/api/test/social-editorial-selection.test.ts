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
  assert.equal(result.postSelectionMethod, 'verified-semantic-editor-v2');
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

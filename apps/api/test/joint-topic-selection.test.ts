import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { SelectedSocialPost } from '@digest/contracts';

import type { SocialSelectionServices } from '../src/modules/social/public/editorial-selection';
import { previewTopicEventSelection } from '../src/modules/social/public/joint-topic-selection';

const time = '2026-11-03T11:00:00Z';
const input = {
  topic: { id: 'games', name: 'Games', description: '', guidance: '' },
  candidates: [
    {
      platform: 'x',
      externalId: 'launch',
      author: 'Studio',
      url: 'https://x.com/studio/status/launch',
      authorUrl: 'https://x.com/studio',
      text: 'Playable demo released today',
      publishedAt: time,
      metrics: { likes: 10 },
      reasons: ['Verified stored X'],
      xTriageEvidence: {
        reportedLikes: 10,
        observedAt: time,
        media: 'unknown',
      },
    },
    {
      platform: 'reddit',
      externalId: 'outage',
      author: 'Developer',
      url: 'https://reddit.com/r/games/comments/outage',
      text: 'Server outage resolved',
      publishedAt: time,
      observedAt: time,
      title: 'Outage',
      subreddit: 'games',
      thumbnail: null,
      externalUrl: null,
      metrics: { score: 100, comments: 5, upvoteRatio: 0.9 },
      reasons: ['Safe Reddit'],
    },
  ] satisfies SelectedSocialPost[],
  blueskyPosts: [
    {
      platform: 'bluesky' as const,
      externalId: 'expansion',
      author: 'dev.bsky.social',
      url: 'https://bsky.app/profile/dev.bsky.social/post/expansion',
      text: 'New expansion released today',
      publishedAt: time,
      observedAt: time,
      metrics: { likes: 15, reposts: 2, replies: 1 },
      media: [
        {
          type: 'image' as const,
          thumbnail: 'https://cdn.bsky.app/thumb.jpg',
          fullsize: 'https://cdn.bsky.app/full.jpg',
          alt: 'Expansion',
        },
      ],
    },
  ],
  policy: { includeAny: [], excludeAny: [] },
  start: new Date('2026-11-02T12:00:00Z'),
  end: new Date('2026-11-03T12:00:00Z'),
  stories: [
    { title: 'Demo released', summary: 'Playable demo released today' },
  ],
  budget: 3,
  runId: 'offline-joint-qualification',
};
function harness(incomplete = false, rejectAll = false) {
  const triaged: string[][] = [];
  let editorCalls = 0;
  const services: SocialSelectionServices = {
    socialTriage: {
      async score(_topic, candidates) {
        triaged.push(candidates.map((post) => post.id));
        return {
          scores: incomplete
            ? []
            : candidates.map((post) => ({
                id: post.id,
                relevance: rejectAll ? 1 : 9,
                importance: 8,
                rationale: 'Scripted qualification',
                event: post.id,
              })),
          unscoredIds: incomplete ? candidates.map((post) => post.id) : [],
        };
      },
    },
    socialEditor: {
      async edit() {
        throw new Error('Independent editor must not run');
      },
      async editOutcome(
        topic,
        candidates,
        budget,
        runId,
        previous,
        stories,
        options,
      ) {
        editorCalls++;
        assert.equal(topic, input.topic);
        assert.equal(budget, 3);
        assert.equal(runId, input.runId);
        assert.deepEqual(previous, []);
        assert.deepEqual(stories, input.stories);
        assert.deepEqual(options, {
          reviewEvents: true,
          completeStoryEvidence: true,
        });
        assert.deepEqual(
          candidates.map((post) => post.id),
          ['launch', 'reddit:outage', 'bluesky:expansion'],
        );
        assert.match(candidates[0].engagementEvidence!, /unverified hint/);
        assert.match(candidates[2].engagementEvidence!, /likes 15/);
        assert.match(candidates[2].engagementEvidence!, /2026-11-03T11:00:00Z/);
        const posts = candidates.map((post) => ({
          id: post.id,
          whyItMatters: '',
          rationale: 'Scripted pick',
        }));
        return {
          status: 'complete',
          value: { model: 'scripted', posts, eventBudgetPreview: posts },
        };
      },
    },
  };
  return { services, triaged, editorCalls: () => editorCalls };
}
void test('joint topic qualification carries real platform evidence and snapshots into exactly one editor call', async () => {
  const h = harness();
  const result = await previewTopicEventSelection(h.services, input);
  assert.equal(result.status, 'complete');
  assert.equal(h.editorCalls(), 1);
  assert.deepEqual(h.triaged, [
    ['launch', 'reddit:outage'],
    ['bluesky:expansion'],
  ]);
  assert.equal(result.eventBudgetPreview?.length, 3);
  for (const snapshot of input.candidates) {
    const post = result.posts.find(
      (post) => post.externalId === snapshot.externalId,
    )!;
    assert.deepEqual(
      { ...post, whyItMatters: undefined, reasons: snapshot.reasons },
      { ...snapshot, whyItMatters: undefined },
    );
  }
  const blue = result.posts.find((post) => post.platform === 'bluesky')!;
  assert.deepEqual(blue.metrics, input.blueskyPosts[0].metrics);
  assert.deepEqual(blue.media, input.blueskyPosts[0].media);
  assert.equal(blue.observedAt, time);
});
void test('incomplete qualification, rejected pools and zero budgets never invoke the joint editor', async () => {
  const incomplete = harness(true);
  assert.equal(
    (await previewTopicEventSelection(incomplete.services, input)).status,
    'unavailable',
  );
  assert.equal(incomplete.triaged.length, 1);
  assert.equal(incomplete.editorCalls(), 0);
  const rejected = harness(false, true);
  assert.deepEqual(
    (await previewTopicEventSelection(rejected.services, input)).posts,
    [],
  );
  assert.equal(rejected.editorCalls(), 0);
  const zero = harness();
  assert.deepEqual(
    (await previewTopicEventSelection(zero.services, { ...input, budget: 0 }))
      .eventBudgetPreview,
    [],
  );
  assert.equal(zero.triaged.length, 0);
  assert.equal(zero.editorCalls(), 0);
});

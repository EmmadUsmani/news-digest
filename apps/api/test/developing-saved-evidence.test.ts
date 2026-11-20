import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { rankedStorySchema } from '@digest/contracts';

import { matchDevelopingStories } from '../src/modules/digests/application/match-developing-stories';
import { snapshotDevelopingStories } from '../src/modules/digests/application/snapshot-developing-stories';
import type { developingHistory } from '../src/modules/digests/domain/developing-history';
import { developingEvidence } from '../src/modules/digests/domain/developing-links';

const fixture = JSON.parse(
  readFileSync(
    new URL(
      './fixtures/developing-stories-saved-2026-11-12-18.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as {
  cases: {
    editionId: string;
    topicId: string;
    topicName: string;
    windowEnd: string;
    stories: { id: string; title: string; summary: string | null }[];
    history: ReturnType<typeof developingHistory>;
    reviews?: {
      storyId: string;
      expectedPredecessors: { editionId: string; storyId: string }[];
    }[];
    reviewedStoryId: string;
    expectedPredecessors: { editionId: string; storyId: string }[];
  }[];
};

for (const item of fixture.cases) {
  const reviews = item.reviews ?? [
    {
      storyId: item.reviewedStoryId,
      expectedPredecessors: item.expectedPredecessors,
    },
  ];
  for (const review of reviews) {
    void test(`saved ${item.topicName} ${item.windowEnd.slice(0, 10)} ${review.storyId} manual memberships preserve earlier coverage`, async () => {
      const evidence = developingEvidence(item.stories, item.history);
      const current = evidence.find(
        (x) => x.editionId === null && x.story.id === review.storyId,
      )!;
      assert.ok(current);
      const previous = review.expectedPredecessors.map((expected) => {
        const occurrence = evidence.find(
          (x) =>
            x.editionId === expected.editionId &&
            x.story.id === expected.storyId,
        );
        assert.ok(occurrence, 'label must refer to an actual saved occurrence');
        return occurrence;
      });
      let calls = 0;
      const links = await matchDevelopingStories(
        {
          async groupWithResult(topicId, candidates) {
            calls++;
            assert.equal(topicId, item.topicId);
            assert.equal(candidates.length, evidence.length);
            // Replay adjudicated memberships, never claim to run a semantic model.
            return {
              status: 'validated',
              groups: reviews
                .filter((label) => label.expectedPredecessors.length)
                .map((label) => [
                  ...label.expectedPredecessors
                    .map(
                      (p) =>
                        evidence.find(
                          (x) =>
                            x.editionId === p.editionId &&
                            x.story.id === p.storyId,
                        )!.reference,
                    )
                    .reverse(),
                  evidence.find(
                    (x) => x.editionId === null && x.story.id === label.storyId,
                  )!.reference,
                ]),
            };
          },
        },
        {
          topicId: item.topicId,
          publishedAt: item.windowEnd,
          runId: 'offline',
        },
        item.stories,
        item.history,
      );
      const originals = structuredClone(item.stories);
      const otherLinks = structuredClone(
        links.filter((link) => link.storyId !== review.storyId),
      );
      const reviewedLinks = links.filter(
        (link) => link.storyId === review.storyId,
      );
      const saved = snapshotDevelopingStories(item.stories, links);
      // Exercise the contract boundary used for full edition snapshots and JSON storage.
      const roundTrip = saved.map((story) =>
        rankedStorySchema.parse(
          JSON.parse(
            JSON.stringify({
              ...story,
              summary: story.summary ?? undefined,
              url: 'https://example.com/saved-report',
              excerpt: '',
              sources: [],
              publishedAt: item.windowEnd,
              score: 0,
              reasons: [],
            }),
          ),
        ),
      );
      assert.deepEqual(item.stories, originals);
      const matched = roundTrip.find((story) => story.id === review.storyId)!;
      assert.deepEqual(
        matched.developing,
        reviewedLinks.length
          ? {
              previousEditionId: reviewedLinks[0].previousEditionId,
              previousStoryId: reviewedLinks[0].previousStoryId,
              previousHeadline: reviewedLinks[0].previousHeadline,
              previousSummary: reviewedLinks[0].previousSummary,
              editionCount: reviewedLinks[0].editionCount,
            }
          : undefined,
      );
      if (reviewedLinks.length) {
        reviewedLinks[0].previousHeadline = 'Changed after snapshot assembly';
        assert.notEqual(
          saved.find((story) => story.id === review.storyId)!.developing!
            .previousHeadline,
          reviewedLinks[0].previousHeadline,
        );
        assert.notEqual(
          matched.developing!.previousHeadline,
          reviewedLinks[0].previousHeadline,
        );
        reviewedLinks[0].previousHeadline = previous[0].story.title;
      }
      assert.deepEqual(
        links.filter((link) => link.storyId !== review.storyId),
        otherLinks,
      );
      assert.deepEqual(
        roundTrip.map((story) => story.id),
        item.stories.map((story) => story.id),
      );
      assert.equal(
        calls,
        1,
        'complete saved pools fit the existing single-call cap',
      );
      assert.deepEqual(
        reviewedLinks,
        previous.length
          ? [
              {
                storyId: review.storyId,
                previousEditionId: previous[0].editionId,
                previousStoryId: previous[0].story.id,
                previousHeadline: previous[0].story.title,
                previousSummary: previous[0].story.summary,
                editionCount: previous.length + 1,
              },
            ]
          : [],
      );
    });
  }
}

void test('snapshot assembly rejects ambiguous and invalid links without changing selected stories', () => {
  const stories = [{ id: 'selected', title: 'Current' }];
  const link = {
    storyId: 'selected',
    previousEditionId: '00000000-0000-4000-8000-000000000001',
    previousStoryId: '00000000-0000-4000-8000-000000000002',
    previousHeadline: 'Earlier',
    previousSummary: null,
    editionCount: 2,
  };
  for (const links of [
    [link, link],
    [{ ...link, storyId: 'unknown' }],
    [{ ...link, editionCount: 1 }],
    [{ ...link, editionCount: 9 }],
    [{ ...link, previousEditionId: 'invalid' }],
  ]) {
    assert.throws(() => snapshotDevelopingStories(stories, links));
    assert.deepEqual(stories, [{ id: 'selected', title: 'Current' }]);
  }
  assert.deepEqual(snapshotDevelopingStories(stories, []), stories);
});

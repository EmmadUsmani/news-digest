import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { matchDevelopingStories } from '../src/modules/digests/application/match-developing-stories';
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
    reviewedStoryId: string;
    expectedPredecessors: { editionId: string; storyId: string }[];
  }[];
};

for (const item of fixture.cases) {
  void test(`saved ${item.topicName} ${item.windowEnd.slice(0, 10)} manual memberships preserve earlier coverage`, async () => {
    const evidence = developingEvidence(item.stories, item.history);
    const current = evidence.find(
      (x) => x.editionId === null && x.story.id === item.reviewedStoryId,
    )!;
    assert.ok(current);
    const previous = item.expectedPredecessors.map((expected) => {
      const occurrence = evidence.find(
        (x) =>
          x.editionId === expected.editionId && x.story.id === expected.storyId,
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
            groups: previous.length
              ? [
                  [
                    ...previous.map((x) => x.reference).reverse(),
                    current.reference,
                  ],
                ]
              : [],
          };
        },
      },
      { topicId: item.topicId, publishedAt: item.windowEnd, runId: 'offline' },
      item.stories,
      item.history,
    );
    assert.equal(
      calls,
      1,
      'complete saved pools fit the existing single-call cap',
    );
    assert.deepEqual(
      links,
      previous.length
        ? [
            {
              storyId: item.reviewedStoryId,
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

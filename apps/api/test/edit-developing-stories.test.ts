import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { editDevelopingStories } from '../src/modules/digests/application/edit-developing-stories';
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
  void test(`saved ${item.topicName} context reaches editor and only selected links reach snapshot`, async () => {
    const before = structuredClone(item);
    const evidence = developingEvidence(item.stories, item.history);
    const current = evidence.find(
      (x) => x.editionId === null && x.story.id === item.reviewedStoryId,
    )!;
    const previous = item.expectedPredecessors.map((expected) =>
      evidence.find(
        (x) =>
          x.editionId === expected.editionId && x.story.id === expected.storyId,
      )!,
    );
    for (const retain of [true, false]) {
      let calls = 0;
      const result = await editDevelopingStories({
        grouping: {
          async groupWithResult() {
            calls++;
            return {
              status: 'validated',
              groups: previous.length
                ? [[current.reference, ...previous.map((x) => x.reference)]]
                : [],
            };
          },
        },
        target: {
          topicId: item.topicId,
          publishedAt: item.windowEnd,
          runId: 'offline',
        },
        candidates: item.stories.map((story) => ({
          ...story,
          earlierCoverage: {
            headline: 'Unvalidated inherited context',
            summary: 'This must not influence the editor.',
          },
        })),
        history: item.history,
        async edit(candidates) {
          assert.equal(calls, 1);
          assert.deepEqual(
            candidates.map((x) => x.id),
            item.stories.map((x) => x.id),
          );
          const reviewed = candidates.find(
            (x) => x.id === item.reviewedStoryId,
          )!;
          const nearest = evidence.find((x) => previous.includes(x));
          assert.deepEqual(
            reviewed.earlierCoverage,
            nearest
              ? {
                  headline: nearest.story.title,
                  summary: nearest.story.summary,
                }
              : undefined,
          );
          return {
            model: 'recorded-transport',
            stories: candidates
              .filter((x) =>
                retain
                  ? x.id === item.reviewedStoryId
                  : x.id !== item.reviewedStoryId,
              )
              .map((x) => ({
                id: x.id,
                headline: 'Editor result',
                summary: 'Current supported prose',
                // Even a plausible editor-supplied relationship is not evidence.
                developing: {
                  previousEditionId: item.history[0].editionId,
                  previousStoryId: '00000000-0000-4000-8000-000000000099',
                  previousHeadline: 'Unvalidated editor relationship',
                  previousSummary: null,
                  editionCount: 8,
                },
              })),
          };
        },
      });
      assert.equal(result?.model, 'recorded-transport');
      for (const story of result.stories) {
        assert.equal(story.summary, 'Current supported prose');
        assert.equal(Boolean(story.developing), retain && previous.length > 0);
        if (story.developing) assert.notEqual(story.developing.editionCount, 8);
        if (story.developing)
          assert.equal(
            story.developing.previousHeadline,
            evidence.find((x) => previous.includes(x))!.story.title,
          );
      }
    }
    assert.deepEqual(item, before);
  });
}

void test('matching failure still edits normally; editor refusal stays null and invalid selections reject', async () => {
  const base = {
    grouping: {
      async groupWithResult(): Promise<never> {
        throw new Error('unavailable');
      },
    },
    target: {
      topicId: 'tech',
      publishedAt: '2026-11-19T12:00:00Z',
      runId: 'offline',
    },
    candidates: [{ id: 'current', title: 'Current headline' }],
    history: [
      {
        editionId: 'earlier',
        publishedAt: '2026-11-18T12:00:00Z',
        stories: [{ id: 'old', title: 'Old headline', summary: null }],
      },
    ],
  };
  const result = await editDevelopingStories({
    ...base,
    async edit(candidates) {
      assert.deepEqual(candidates, base.candidates);
      return { stories: [{ id: 'current', headline: 'Edited normally' }] };
    },
  });
  assert.deepEqual(result, {
    stories: [{ id: 'current', headline: 'Edited normally' }],
  });
  assert.equal(
    await editDevelopingStories({
      ...base,
      async edit() {
        return null;
      },
    }),
    null,
  );
  for (const stories of [
    [{ id: 'old' }],
    [{ id: 'current' }, { id: 'current' }],
  ])
    await assert.rejects(
      editDevelopingStories({
        ...base,
        async edit() {
          return { stories };
        },
      }),
      /unique current candidates/,
    );
});

void test('ambiguous candidate IDs reject before matching or editing can spend budget', async () => {
  for (const ids of [['same', 'same'], [''], ['   ']]) {
    let calls = 0;
    await assert.rejects(
      editDevelopingStories({
        grouping: {
          async groupWithResult() {
            calls++;
            return { status: 'validated' as const, groups: [] };
          },
        },
        target: {
          topicId: 'tech',
          publishedAt: '2026-11-19T12:00:00Z',
          runId: 'offline',
        },
        candidates: ids.map((id, index) => ({
          id,
          title: `Distinct event ${index}`,
        })),
        history: [
          {
            editionId: 'earlier',
            publishedAt: '2026-11-18T12:00:00Z',
            stories: [{ id: 'old', title: 'Earlier event', summary: null }],
          },
        ],
        async edit() {
          calls++;
          return { stories: [] };
        },
      }),
      /unique nonempty candidate IDs/,
    );
    assert.equal(calls, 0);
  }
});

void test('editor cannot publish its own earlier-coverage relationship when matching is unavailable', async () => {
  const developing = {
    previousEditionId: '00000000-0000-4000-8000-000000000001',
    previousStoryId: '00000000-0000-4000-8000-000000000002',
    previousHeadline: 'Unvalidated earlier coverage',
    previousSummary: null,
    editionCount: 2,
  };
  const editorStory = {
    id: 'current',
    headline: 'Current reporting',
    developing,
  };
  const before = structuredClone(editorStory);
  const result = await editDevelopingStories({
    grouping: null,
    target: {
      topicId: 'tech',
      publishedAt: '2026-11-19T12:00:00Z',
      runId: 'offline',
    },
    candidates: [{ id: 'current', title: 'Current reporting' }],
    history: [],
    async edit() {
      return { stories: [editorStory] };
    },
  });
  assert.deepEqual(result, {
    stories: [{ id: 'current', headline: 'Current reporting' }],
  });
  assert.deepEqual(editorStory, before);
});

void test('unavailable or empty matching removes inherited editor context without mutating candidates', async () => {
  const candidates = [
    {
      id: 'current',
      title: 'Current reporting',
      publisher: 'Original outlet',
      earlierCoverage: { headline: 'Stale headline', summary: 'Stale summary' },
    },
  ];
  const before = structuredClone(candidates);
  for (const grouping of [
    null,
    {
      async groupWithResult() {
        return { status: 'validated' as const, groups: [] };
      },
    },
  ]) {
    await editDevelopingStories({
      grouping,
      target: {
        topicId: 'tech',
        publishedAt: '2026-11-19T12:00:00Z',
        runId: 'offline',
      },
      candidates,
      history: [
        {
          editionId: 'previous',
          publishedAt: '2026-11-18T12:00:00Z',
          stories: [{ id: 'old', title: 'Earlier reporting', summary: null }],
        },
      ],
      async edit(received) {
        assert.deepEqual(received, [
          {
            id: 'current',
            title: 'Current reporting',
            publisher: 'Original outlet',
          },
        ]);
        assert.equal(Object.hasOwn(received[0], 'earlierCoverage'), false);
        return { stories: [{ id: 'current' }] };
      },
    });
    assert.deepEqual(candidates, before);
  }
});

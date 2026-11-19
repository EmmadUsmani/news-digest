import assert from 'node:assert/strict';
import { test } from 'node:test';

import { traceReferenceStories } from '../scripts/trace-reference-stories';

const id = '00000000-0000-4000-8000-000000000001';
const date = '2026-11-18T14:00:00Z';
const reference = (url: string) => ({
  title: 'Saved reference',
  excerpt: 'Original reporting — preserved for review.',
  url,
  publishedAt: date,
});

void test('feed publisher identity reaches saved selected coverage without title inference', () => {
  const report = traceReferenceStories(
    {
      ...capture,
      feeds: [
        {
          ...capture.feeds[0],
          stories: [
            {
              ...reference('https://www.techmeme.com/261119/p32'),
              publisherUrl: 'https://example.com/lead',
            },
          ],
        },
      ],
    },
    edition,
  );
  const story = report.feeds[0].stories![0];
  assert.equal(story.url, 'https://www.techmeme.com/261119/p32');
  assert.equal(story.publisherUrl, 'https://example.com/lead');
  assert.deepEqual(story.selectedClusters, [{ id, title: 'Selected event' }]);
});
const edition = {
  id,
  createdAt: date,
  windowStart: '2026-11-17T15:00:00Z',
  windowEnd: '2026-11-18T15:00:00Z',
  topics: [
    {
      id,
      name: 'Gaming',
      brief: [],
      posts: [],
      stories: [
        {
          id,
          title: 'Selected event',
          url: 'https://example.com/lead',
          publishedAt: date,
          sources: ['Publisher'],
          summary: 'Saved prose',
          coverage: [
            {
              id,
              title: 'Same event',
              url: 'https://example.com/coverage?a=1&b=2',
              sources: ['Other'],
              publishedAt: date,
            },
          ],
        },
      ],
    },
  ],
};
const capture = {
  schemaVersion: 1,
  start: edition.windowStart,
  end: edition.windowEnd,
  capturedAt: date,
  windowEnded: false,
  feeds: [
    {
      topic: 'Gaming',
      name: 'Reference',
      observedAt: date,
      stories: [
        reference('https://example.com/lead?utm_source=feed#top'),
        reference('https://example.com/coverage?b=2&a=1'),
        reference('https://example.com/other'),
      ],
    },
  ],
};

void test('reference trace uses saved coverage and canonical URLs without declaring other URLs misses', () => {
  const before = JSON.stringify({ capture, edition });
  const report = traceReferenceStories(capture, edition);
  assert.equal(report.windowEnded, false);
  assert.equal(
    traceReferenceStories({ ...capture, windowEnded: undefined }, edition)
      .windowEnded,
    false,
  );
  const stories = report.feeds[0].stories!;
  assert.equal(
    stories[2].excerpt,
    'Original reporting — preserved for review.',
  );
  assert.deepEqual(
    stories.map((story) => story.status),
    ['selected-cluster-url', 'selected-cluster-url', 'needs-event-review'],
  );
  assert.deepEqual(stories[1].selectedClusters, [
    { id, title: 'Selected event' },
  ]);
  assert.equal(JSON.stringify({ capture, edition }), before);
  const otherTopic = traceReferenceStories(
    { ...capture, feeds: [{ ...capture.feeds[0], topic: 'NBA' }] },
    edition,
  );
  assert.equal(otherTopic.feeds[0].topicAvailable, false);
  assert.ok(
    otherTopic.feeds[0].stories.every(
      (story) => story.status === 'needs-event-review',
    ),
  );
  const failed = traceReferenceStories(
    {
      ...capture,
      feeds: [
        {
          topic: 'Gaming',
          name: 'Failed',
          observedAt: date,
          error: 'HTTP 503',
        },
      ],
    },
    edition,
  );
  assert.equal(failed.feeds[0].error, 'HTTP 503');
  assert.equal(failed.feeds[0].stories, undefined);
});

void test('reference trace refuses mismatched windows, out-of-window entries and ambiguous topics', () => {
  assert.throws(
    () => traceReferenceStories({ ...capture, start: date }, edition),
    /windows/,
  );
  assert.throws(
    () =>
      traceReferenceStories(
        {
          ...capture,
          feeds: [
            {
              ...capture.feeds[0],
              stories: [
                {
                  ...reference('https://example.com/lead'),
                  publishedAt: edition.windowEnd,
                },
              ],
            },
          ],
        },
        edition,
      ),
    /outside/,
  );
  assert.throws(
    () =>
      traceReferenceStories(capture, {
        ...edition,
        topics: [...edition.topics, ...edition.topics],
      }),
    /Ambiguous/,
  );
  assert.throws(
    () =>
      traceReferenceStories(
        {
          ...capture,
          feeds: [
            {
              ...capture.feeds[0],
              stories: [reference('https://user:password@example.com/lead')],
            },
          ],
        },
        edition,
      ),
    /Invalid reference URL/,
  );
});

void test('reference trace retains early observations when capture crosses window end', () => {
  const late = '2026-11-18T15:01:00Z';
  const mixed = {
    ...capture,
    capturedAt: late,
    windowEnded: true,
    feeds: [
      capture.feeds[0],
      { ...capture.feeds[0], name: 'Later', observedAt: late },
    ],
  };
  const report = traceReferenceStories(mixed, edition);
  assert.equal(report.windowEnded, false);
  assert.deepEqual(
    report.feeds.map((feed) => feed.windowEnded),
    [false, true],
  );
  assert.equal(
    traceReferenceStories({ ...mixed, feeds: [mixed.feeds[1]] }, edition)
      .windowEnded,
    true,
  );
  assert.equal(
    traceReferenceStories({ ...mixed, feeds: [] }, edition).windowEnded,
    false,
  );
  const failed = traceReferenceStories(
    {
      ...mixed,
      feeds: [
        {
          topic: 'Gaming',
          name: 'Unavailable',
          observedAt: date,
          error: 'HTTP 503',
        },
      ],
    },
    edition,
  );
  assert.equal(failed.windowEnded, false);
  assert.equal(failed.feeds[0].windowEnded, false);
  assert.equal(failed.feeds[0].error, 'HTTP 503');
});

void test('optional saved snapshot traces editor admission without inferring collection gaps or misses', () => {
  const droppedId = '00000000-0000-4000-8000-000000000002';
  const prompt = {
    topic: { id },
    candidates: [
      { id, title: 'Selected event', url: 'https://example.com/lead' },
      {
        id: droppedId,
        title: 'Unselected event',
        url: 'https://example.com/other?utm_source=publisher',
        clusterEvidence: [{ id: 'member-without-url' }],
      },
    ],
  };
  const snapshot = {
    ...edition,
    method: 'editorial-v1',
    topics: [
      {
        ...edition.topics[0],
        candidateCount: 10,
        stories: edition.topics[0].stories.map((story) => ({
          ...story,
          excerpt: 'Saved original',
          score: 1,
          reasons: [],
        })),
        editorial: {
          mode: 'ai',
          model: 'saved-model',
          reason: 'Saved result',
          brief: [],
          candidatePrompt: JSON.stringify(prompt),
          triage: [
            {
              id: droppedId,
              importance: 8,
              relevance: 9,
              event: 'Saved event',
              rationale: 'Original triage reason',
            },
          ],
          unscoredIds: [],
        },
      },
    ],
  };
  // Joint ownership must route to the assigned topic, including when it differs
  // from the reference feed's topic. Missing prompts remain unknown.
  const destinationId = '00000000-0000-4000-8000-000000000003';
  const ownership = {
    inputArticles: [
      { id, url: 'https://example.com/lead' },
      { id: droppedId, url: 'https://example.com/other' },
    ],
    groups: [{ topicId: destinationId, ids: [id, droppedId] }],
  };
  const ownershipTrace = (value: unknown, withPrompt = false) =>
    traceReferenceStories(
      capture,
      {
        ...edition,
        topics: [
          ...edition.topics,
          { ...edition.topics[0], id: destinationId, name: 'World' },
        ],
      },
      {
        ...snapshot,
        topics: [
          {
            ...snapshot.topics[0],
            editorial: {
              ...snapshot.topics[0].editorial,
              storyOwnership: value,
            },
          },
          {
            ...snapshot.topics[0],
            id: destinationId,
            name: 'World',
            editorial: withPrompt
              ? {
                  ...snapshot.topics[0].editorial,
                  candidatePrompt: JSON.stringify({
                    ...prompt,
                    topic: { id: destinationId },
                  }),
                }
              : undefined,
          },
        ],
      },
    ).feeds[0].stories![2].ownershipInput;
  assert.deepEqual(ownershipTrace(ownership), {
    membershipRoutes: [
      {
        inputId: droppedId,
        topicId: destinationId,
        memberIds: [id, droppedId],
        selectedClusters: [{ id, title: 'Selected event' }],
        editorCandidates: null,
      },
    ],
  });
  assert.deepEqual(
    ownershipTrace(ownership, true)?.membershipRoutes[0].editorCandidates,
    prompt.candidates.map(({ id, title }) => ({ id, title })),
  );
  assert.equal(ownershipTrace(undefined), null);
  for (const groups of [
    [{ topicId: destinationId, ids: [id] }],
    [{ topicId: destinationId, ids: [id, id, droppedId] }],
    [{ topicId: destinationId, ids: [id, droppedId, 'foreign'] }],
    [{ topicId: 'foreign', ids: [id, droppedId] }],
  ])
    assert.equal(ownershipTrace({ ...ownership, groups }), null);
  assert.equal(
    ownershipTrace({
      ...ownership,
      inputArticles: [ownership.inputArticles[0], ownership.inputArticles[0]],
    }),
    null,
  );
  assert.deepEqual(
    ownershipTrace({
      ...ownership,
      inputArticles: ownership.inputArticles.map((a) => ({
        ...a,
        url: 'https://example.com/absent',
      })),
    }),
    { membershipRoutes: [] },
  );
  const grouping = {
    topicId: id,
    inputIds: [id, droppedId],
    inputArticles: [
      { id, url: 'https://example.com/lead' },
      { id: droppedId, url: 'https://example.com/other' },
    ],
    result: { status: 'validated', groups: [[id, droppedId]] },
  };
  const groupedSnapshot = (storyGrouping: unknown) => ({
    ...snapshot,
    topics: [
      {
        ...snapshot.topics[0],
        editorial: { ...snapshot.topics[0].editorial, storyGrouping },
      },
    ],
  });
  const grouped = traceReferenceStories(
    capture,
    edition,
    groupedSnapshot(grouping),
  ).feeds[0].stories!;
  assert.deepEqual(grouped[2].groupingInput, {
    matchingIds: [droppedId],
    result: grouping.result,
    membershipRoutes: [
      {
        inputId: droppedId,
        memberIds: [id, droppedId],
        selectedClusters: [{ id, title: 'Selected event' }],
        editorCandidates: prompt.candidates.map(({ id, title }) => ({
          id,
          title,
        })),
      },
    ],
  });
  assert.equal(grouped[2].status, 'needs-event-review');
  const unavailable = { status: 'unavailable', reason: 'no-result' };
  assert.deepEqual(
    traceReferenceStories(
      capture,
      edition,
      groupedSnapshot({ ...grouping, result: unavailable }),
    ).feeds[0].stories![2].groupingInput,
    {
      matchingIds: [droppedId],
      result: unavailable,
      membershipRoutes: null,
    },
  );
  for (const invalid of [
    { ...grouping, inputArticles: undefined },
    { ...grouping, topicId: droppedId },
    {
      ...grouping,
      inputArticles: [grouping.inputArticles[0], grouping.inputArticles[0]],
    },
    { ...grouping, inputIds: [id, 'unknown'] },
    ...[
      [[id]],
      [[id, 'unknown']],
      [[id, id]],
      [
        [id, droppedId],
        [id, droppedId],
      ],
    ].map((groups) => ({
      ...grouping,
      result: { status: 'validated', groups },
    })),
  ]) {
    assert.equal(
      traceReferenceStories(capture, edition, groupedSnapshot(invalid)).feeds[0]
        .stories![2].groupingInput,
      null,
    );
  }
  const singleton = traceReferenceStories(
    capture,
    edition,
    groupedSnapshot({
      ...grouping,
      result: { status: 'validated', groups: [] },
    }),
  ).feeds[0].stories![2].groupingInput;
  assert.deepEqual(singleton?.membershipRoutes, [
    {
      inputId: droppedId,
      memberIds: [droppedId],
      selectedClusters: [],
      editorCandidates: [{ id: droppedId, title: 'Unselected event' }],
    },
  ]);
  const absent = traceReferenceStories(
    capture,
    edition,
    groupedSnapshot({
      ...grouping,
      inputArticles: grouping.inputArticles.map((article) => ({
        ...article,
        url: 'https://example.com/unrelated/' + article.id,
      })),
    }),
  ).feeds[0].stories![2].groupingInput;
  assert.deepEqual(absent?.membershipRoutes, []);
  const withoutPrompt = groupedSnapshot(grouping);
  const missingPrompt = traceReferenceStories(capture, edition, {
    ...withoutPrompt,
    topics: [
      {
        ...withoutPrompt.topics[0],
        editorial: {
          ...withoutPrompt.topics[0].editorial,
          candidatePrompt: undefined,
        },
      },
    ],
  }).feeds[0].stories![2].groupingInput;
  assert.equal(missingPrompt?.membershipRoutes?.[0].editorCandidates, null);
  assert.deepEqual(missingPrompt?.membershipRoutes?.[0].selectedClusters, [
    { id, title: 'Selected event' },
  ]);
  const viaEvidence = groupedSnapshot({
    ...grouping,
    result: { status: 'validated', groups: [] },
  });
  const evidenceRoute = traceReferenceStories(capture, edition, {
    ...viaEvidence,
    topics: [
      {
        ...viaEvidence.topics[0],
        editorial: {
          ...viaEvidence.topics[0].editorial,
          candidatePrompt: JSON.stringify({
            topic: { id },
            candidates: [
              {
                id,
                title: 'Selected event',
                clusterEvidence: [{ id: droppedId }],
              },
            ],
          }),
        },
      },
    ],
  }).feeds[0].stories![2].groupingInput;
  assert.deepEqual(evidenceRoute?.membershipRoutes?.[0].editorCandidates, [
    { id, title: 'Selected event' },
  ]);
  assert.deepEqual(evidenceRoute?.membershipRoutes?.[0].selectedClusters, []);
  const before = JSON.stringify({ capture, edition, snapshot });
  const report = traceReferenceStories(capture, edition, snapshot);
  const stories = report.feeds[0].stories!;
  assert.equal(stories[2].status, 'needs-event-review');
  assert.deepEqual(stories[2].editorInput, {
    available: true,
    membersWithoutUrl: 1,
    matchingCandidates: [
      {
        id: droppedId,
        title: 'Unselected event',
        selected: false,
        triage: snapshot.topics[0].editorial.triage[0],
      },
    ],
  });
  assert.equal(stories[0].editorInput!.matchingCandidates[0].selected, true);
  const publisherCapture = {
    ...capture,
    feeds: [
      {
        ...capture.feeds[0],
        stories: [
          {
            ...reference('https://www.techmeme.com/261119/p32'),
            publisherUrl: capture.feeds[0].stories[2].url,
          },
        ],
      },
    ],
  };
  const publisherStory = traceReferenceStories(
    publisherCapture,
    edition,
    snapshot,
  ).feeds[0].stories![0];
  assert.deepEqual(publisherStory.editorInput, stories[2].editorInput);
  assert.equal(publisherStory.status, 'needs-event-review');
  assert.equal(stories[1].editorInput!.matchingCandidates.length, 0);
  assert.equal(JSON.stringify({ capture, edition, snapshot }), before);
  assert.throws(
    () =>
      traceReferenceStories(capture, edition, { ...snapshot, id: droppedId }),
    /Snapshot and reader/,
  );
  assert.throws(
    () =>
      traceReferenceStories(capture, edition, { ...snapshot, windowEnd: date }),
    /Snapshot and reader/,
  );
  for (const candidatePrompt of [
    undefined,
    '{',
    JSON.stringify({ ...prompt, topic: { id: droppedId } }),
    JSON.stringify({
      ...prompt,
      candidates: [prompt.candidates[0], prompt.candidates[0]],
    }),
  ]) {
    const result = traceReferenceStories(capture, edition, {
      ...snapshot,
      topics: [
        {
          ...snapshot.topics[0],
          editorial: { ...snapshot.topics[0].editorial, candidatePrompt },
        },
      ],
    });
    assert.deepEqual(result.feeds[0].stories![2].editorInput, {
      available: false,
      membersWithoutUrl: null,
      matchingCandidates: [],
    });
  }
  const supplementalPrompt = {
    ...prompt,
    candidates: [
      {
        ...prompt.candidates[1],
        clusterEvidence: [
          { id: 'supplement', url: 'https://example.com/coverage?a=1&b=2' },
        ],
      },
    ],
  };
  const supplemental = traceReferenceStories(capture, edition, {
    ...snapshot,
    topics: [
      {
        ...snapshot.topics[0],
        editorial: {
          ...snapshot.topics[0].editorial,
          candidatePrompt: JSON.stringify(supplementalPrompt),
        },
      },
    ],
  });
  assert.equal(
    supplemental.feeds[0].stories![1].editorInput!.matchingCandidates[0].id,
    droppedId,
  );
  assert.equal(
    supplemental.feeds[0].stories![1].editorInput!.matchingCandidates[0]
      .selected,
    false,
  );
  assert.throws(
    () =>
      traceReferenceStories(capture, edition, {
        ...snapshot,
        topics: [snapshot.topics[0], snapshot.topics[0]],
      }),
    /Ambiguous snapshot/,
  );
  const otherTopic = traceReferenceStories(capture, edition, {
    ...snapshot,
    topics: [{ ...snapshot.topics[0], id: droppedId }],
  });
  assert.equal(otherTopic.feeds[0].stories![2].editorInput!.available, false);
});

void test('rolling reference observations retain early stories, later failures and provenance', () => {
  const late = {
    ...capture,
    capturedAt: '2026-11-18T15:05:00Z',
    feeds: [
      {
        ...capture.feeds[0],
        observedAt: '2026-11-18T15:04:00Z',
        stories: [reference('https://example.com/later')],
      },
    ],
  };
  const failed = {
    ...late,
    capturedAt: '2026-11-18T15:10:00Z',
    feeds: [
      {
        topic: 'Gaming',
        name: 'Reference',
        observedAt: '2026-11-18T15:09:00Z',
        error: 'HTTP 503',
      },
    ],
  };
  const observations = [capture, late, failed];
  const before = JSON.stringify(observations);
  const report = traceReferenceStories(observations, edition);
  assert.equal(report.observationCount, 3);
  assert.equal(report.capturedAt, failed.capturedAt);
  assert.equal(report.windowEnded, false);
  assert.equal(report.feeds[0].stories?.length, 3);
  assert.equal(report.feeds[0].captureCompletedAt, capture.capturedAt);
  assert.equal(report.feeds[1].windowEnded, true);
  assert.equal(report.feeds[1].stories?.[0].url, 'https://example.com/later');
  assert.equal(report.feeds[2].error, 'HTTP 503');
  assert.equal(JSON.stringify(observations), before);
  assert.equal(
    traceReferenceStories([...observations].reverse(), edition).capturedAt,
    failed.capturedAt,
  );
  assert.throws(() => traceReferenceStories([], edition), /No reference/);
  assert.throws(
    () => traceReferenceStories([capture, { ...late, start: date }], edition),
    /windows/,
  );
});

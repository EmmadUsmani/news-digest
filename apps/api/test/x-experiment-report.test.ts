import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  type XExperimentEvidence,
  xExperimentReport,
} from '../../../scripts/lib/x-experiment-report';

function evidence(): XExperimentEvidence {
  return {
    requestId: 'one',
    topicId: 'nba',
    model: 'grok-4.3',
    style: 'reactions',
    window: { start: '2026-11-03T15:00:00Z', end: '2026-11-04T15:00:00Z' },
    costMicros: 50_000,
    postsFetched: 8,
    actualToolCalls: [
      {
        name: 'x_keyword_search',
        arguments: { query: 'play OR trade min_faves:100', mode: 'Top' },
      },
    ],
    posts: [
      {
        id: '1',
        publishedAt: '2026-11-03T15:00:00Z',
        likes: 100,
        relevance: 6,
        promotion: false,
      },
      {
        id: '2',
        publishedAt: '2026-11-04T14:00:00Z',
        likes: 500,
        relevance: 9,
        promotion: true,
      },
      {
        id: '3',
        publishedAt: '2026-11-04T15:00:00Z',
        likes: 200,
        relevance: 5,
        promotion: false,
      },
      {
        id: '4',
        publishedAt: '2026-11-03T14:59:59Z',
        likes: 0,
        relevance: 8,
        promotion: false,
      },
    ],
  };
}
void test('offline report measures exact windows, reported likes, promotions and eligible yield', () => {
  const call = evidence();
  const [report] = xExperimentReport([call]);
  assert.equal(report.postsFetched, 8);
  assert.equal(report.returnedPosts, 4);
  assert.deepEqual(report.reportedLikes, {
    observed: 4,
    median: 150,
    maximum: 500,
  });
  assert.equal(report.inWindowShare, 0.5);
  assert.equal(report.triagePassingShare, 0.75);
  assert.equal(report.promotions, 1);
  assert.equal(report.zeroPromotions, false);
  assert.equal(report.eligiblePosts, 1);
  assert.equal(report.eligiblePostsPerDollar, 20);
  assert.deepEqual(report.actualToolCalls, call.actualToolCalls);
});
void test('missing review and engagement stay unknown; empty or free calls do not invent ratios', () => {
  const call = evidence();
  call.posts = [
    {
      id: '1',
      publishedAt: null,
      likes: null,
      relevance: null,
      promotion: null,
    },
  ];
  const [report] = xExperimentReport([call]);
  assert.deepEqual(report.unknown, {
    publishedAt: 1,
    likes: 1,
    relevance: 1,
    promotion: 1,
  });
  for (const key of [
    'inWindowShare',
    'triagePassingShare',
    'eligiblePosts',
    'eligiblePostsPerDollar',
    'zeroPromotions',
  ] as const)
    assert.equal(report[key], null);
  assert.equal(report.reportedLikes.median, null);
  call.posts = [];
  call.costMicros = 0;
  const [empty] = xExperimentReport([call]);
  assert.equal(empty.inWindowShare, null);
  assert.equal(empty.eligiblePosts, 0);
  assert.equal(empty.eligiblePostsPerDollar, null);
  call.posts = [evidence().posts[0]];
  assert.equal(xExperimentReport([call])[0].reportedLikes.median, 100);
});
void test('invalid or duplicated evidence cannot silently inflate comparisons', () => {
  assert.throws(() => xExperimentReport([evidence(), evidence()]));
  const duplicate = evidence();
  duplicate.posts.push(duplicate.posts[0]);
  assert.throws(() => xExperimentReport([duplicate]));
  for (const patch of [
    { costMicros: -1 },
    { postsFetched: 0.5 },
    { window: { start: 'bad', end: 'bad' } },
  ])
    assert.throws(() => xExperimentReport([{ ...evidence(), ...patch }]));
  for (const patch of [
    { likes: -1 },
    { relevance: 11 },
    { publishedAt: 'bad' },
  ]) {
    const call = evidence();
    call.posts[0] = { ...call.posts[0], ...patch };
    assert.throws(() => xExperimentReport([call]));
  }
});

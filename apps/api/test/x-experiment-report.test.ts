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

function searchCall(query: string, mode = 'Top') {
  return { name: 'x_keyword_search', input: JSON.stringify({ query, mode }) };
}
const suffix = '-filter:replies -filter:retweets lang:en -bet min_faves:100';
void test('execution report checks actual adapter inputs and separates reported threshold contradictions', () => {
  const call = evidence();
  call.expectedSearch = { minFaves: 100, exclusions: ['-bet'] };
  call.actualToolCalls = [searchCall(`play OR trade ${suffix}`)];
  call.posts.push({ ...call.posts[0], id: '5', likes: null });
  const result = xExperimentReport([call])[0].searchExecution!;
  assert.equal(result.inputsMatch, true);
  assert.equal(result.returnedBelowThreshold, 1);
  assert.equal(result.returnedWithUnknownLikes, 1);
  assert.deepEqual(result.expected, call.expectedSearch);
  for (const query of [
    `play trade ${suffix}`,
    `play "OR" trade ${suffix}`,
    `play OR trade "${suffix}"`,
    `play OR trade min_faves:50 ${suffix}`,
    `play OR trade lang:es ${suffix}`,
    `play OR trade filter:replies ${suffix}`,
    'play OR trade -filter:replies -filter:retweets lang:en min_faves:100',
  ]) {
    call.actualToolCalls = [searchCall(query)];
    assert.equal(
      xExperimentReport([call])[0].searchExecution!.inputsMatch,
      false,
      query,
    );
  }
  call.actualToolCalls = [searchCall(`play OR trade ${suffix}`, 'Latest')];
  assert.equal(
    xExperimentReport([call])[0].searchExecution!.inputsMatch,
    false,
  );
});
void test('missing or unreadable tool evidence cannot establish execution compliance', () => {
  const call = evidence();
  assert.equal(xExperimentReport([call])[0].searchExecution, null);
  call.expectedSearch = { minFaves: 100, exclusions: ['-bet'] };
  for (const calls of [
    [],
    [{ name: 'x_keyword_search', input: 'bad-json' }],
    [
      {
        name: 'x_keyword_search',
        arguments: { query: `play OR trade ${suffix}`, mode: 'Top' },
      },
    ],
    [
      searchCall(`play OR trade ${suffix}`),
      { name: 'x_semantic_search', input: '{}' },
    ],
    [searchCall(`play OR trade "${suffix}`)],
    [null, 42, 'assistant prose'],
  ]) {
    call.actualToolCalls = calls;
    assert.equal(
      xExperimentReport([call])[0].searchExecution!.inputsMatch,
      null,
    );
  }
  call.actualToolCalls = [
    searchCall(`play OR trade ${suffix}`),
    searchCall('play OR trade', 'Latest'),
  ];
  assert.equal(
    xExperimentReport([call])[0].searchExecution!.inputsMatch,
    false,
  );
});
void test('unreadable sibling evidence cannot hide a confirmed execution violation', () => {
  const call = evidence();
  call.expectedSearch = { minFaves: 100, exclusions: ['-bet'] };
  const valid = searchCall(`play OR trade ${suffix}`);
  const unknown = { name: 'x_keyword_search', input: 'bad-json' };
  for (const invalid of [
    searchCall(`play OR trade ${suffix}`, 'Latest'),
    searchCall(
      'play OR trade -filter:replies -filter:retweets lang:en -bet min_faves:50',
    ),
    searchCall('play OR trade -filter:replies lang:en -bet min_faves:100'),
    searchCall(
      'play OR trade -filter:replies -filter:retweets lang:en min_faves:100',
    ),
    searchCall(`play trade ${suffix}`),
  ]) {
    for (const records of [
      [invalid, unknown],
      [unknown, valid, invalid],
      [invalid, null, valid],
    ]) {
      call.actualToolCalls = records;
      assert.equal(
        xExperimentReport([call])[0].searchExecution!.inputsMatch,
        false,
      );
    }
  }
  call.actualToolCalls = [valid, unknown];
  assert.equal(xExperimentReport([call])[0].searchExecution!.inputsMatch, null);
  call.actualToolCalls = [valid];
  assert.equal(xExperimentReport([call])[0].searchExecution!.inputsMatch, true);
});
void test('trending does not require story OR and invalid expected settings are rejected', () => {
  const call = evidence();
  call.style = 'trending';
  call.expectedSearch = { minFaves: 100, exclusions: ['-bet'] };
  call.actualToolCalls = [searchCall(`play ${suffix}`)];
  const result = xExperimentReport([call])[0].searchExecution!;
  assert.equal(result.inputsMatch, true);
  assert.equal(result.queries[0].observed && result.queries[0].storyOr, null);
  call.style = 'current';
  assert.equal(xExperimentReport([call])[0].searchExecution, null);
  call.style = 'reactions';
  for (const settings of [
    { minFaves: -1, exclusions: [] },
    { minFaves: 0.5, exclusions: [] },
    { minFaves: 100, exclusions: ['-bet OR spam'] },
  ]) {
    call.expectedSearch = settings;
    assert.throws(() => xExperimentReport([call]));
  }
});

void test('saved eligibility requires timezone-qualified instants in windows and posts', () => {
  for (const ambiguous of [
    '2026-11-03',
    '2026-11-03T15:00:00',
    'November 3, 2026 15:00 UTC',
  ]) {
    for (const field of ['start', 'end', 'publishedAt'] as const) {
      const call = evidence();
      if (field === 'publishedAt') call.posts[0].publishedAt = ambiguous;
      else call.window[field] = ambiguous;
      assert.throws(
        () => xExperimentReport([call]),
        /Invalid experiment/,
        field,
      );
    }
  }
  const call = evidence();
  call.window.start = '2026-11-03T07:00:00-08:00';
  call.window.end = '2026-11-04T16:00:00+01:00';
  call.posts[0].publishedAt = '2026-11-03T07:00:00.000-08:00';
  call.posts[2].publishedAt = '2026-11-04T16:00:00+01:00';
  const [report] = xExperimentReport([call]);
  assert.equal(report.inWindow, 2);
  assert.equal(report.eligiblePosts, 1);
  call.posts[0].publishedAt = null;
  assert.equal(xExperimentReport([call])[0].eligiblePosts, null);
});

void test('confirmed promotions remain failures beside unreviewed posts in either order', () => {
  for (const reverse of [false, true]) {
    const call = evidence();
    call.posts[0].promotion = null;
    if (reverse) call.posts.reverse();
    const [report] = xExperimentReport([call]);
    assert.equal(report.zeroPromotions, false);
    assert.equal(report.promotions, 1);
    assert.equal(report.unknown.promotion, 1);
    assert.equal(report.eligiblePosts, null);
    assert.equal(report.eligiblePostsPerDollar, null);
    call.posts = call.posts.filter((post) => post.promotion !== true);
    assert.equal(xExperimentReport([call])[0].zeroPromotions, null);
  }
});

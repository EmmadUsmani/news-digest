import assert from 'node:assert/strict';
import { test } from 'node:test';

import { selectedSocialPostSchema } from '@digest/contracts';

import {
  collectTimingEvidence,
  scheduledTiming,
  selectedPostEvidence,
  timingEvidence,
  timingOptions,
} from '../../../scripts/lib/scheduled-timing';

void test('scheduled offsets include pre-worker delay and preserve early starts', () => {
  assert.deepEqual(
    scheduledTiming({
      scheduledAt: '2026-11-03T15:00:00Z',
      startedAt: '2026-11-03T15:00:05Z',
      finishedAt: '2026-11-03T15:00:45Z',
    }),
    { scheduledStartDelayMs: 5000, scheduledCompletionDelayMs: 45000 },
  );
  assert.deepEqual(
    scheduledTiming({
      scheduledAt: '2026-11-03T15:00:00Z',
      startedAt: '2026-11-03T14:59:59Z',
      finishedAt: '2026-11-03T15:00:01Z',
    }),
    { scheduledStartDelayMs: -1000, scheduledCompletionDelayMs: 1000 },
  );
});

void test('manual runs and missing or invalid timestamps have unknown offsets', () => {
  for (const scheduledAt of [null, 'invalid']) {
    assert.deepEqual(
      scheduledTiming({
        scheduledAt,
        startedAt: '2026-11-03T15:00:05Z',
        finishedAt: '2026-11-03T15:00:45Z',
      }),
      { scheduledStartDelayMs: null, scheduledCompletionDelayMs: null },
    );
  }
  assert.deepEqual(
    scheduledTiming({
      scheduledAt: '2026-11-03T15:00:00Z',
      startedAt: null,
      finishedAt: null,
    }),
    { scheduledStartDelayMs: null, scheduledCompletionDelayMs: null },
  );
});

void test('schedule offsets handle UTC day boundaries and equivalent timezone offsets', () => {
  assert.deepEqual(
    scheduledTiming({
      scheduledAt: '2026-11-03T23:59:59Z',
      startedAt: '2026-11-03T16:00:00-08:00',
      finishedAt: '2026-11-04T00:00:02Z',
    }),
    { scheduledStartDelayMs: 1000, scheduledCompletionDelayMs: 3000 },
  );
});

void test('scheduled evidence survives newer manual completions and unordered input', () => {
  const run = (
    id: string,
    day: number,
    scheduled = false,
    state = 'completed',
  ) => ({
    id,
    state,
    attempts: 1,
    scheduledAt: scheduled ? `2026-11-0${day}T15:00:00Z` : null,
    startedAt: `2026-11-0${day}T15:00:01Z`,
    finishedAt: `2026-11-0${day}T15:00:10Z`,
    durationMs: 9000,
    editionId: state === 'completed' ? id : null,
    skipped: null,
  });
  const scheduled = run('scheduled', 2, true);
  const manuals = [run('m1', 3), run('m2', 4), run('m3', 5)];
  const input = [manuals[0], scheduled, manuals[2], manuals[1]];
  const evidence = timingEvidence(input);
  assert.deepEqual(
    evidence.completed.map((item) => item.id),
    ['m3', 'm2', 'm1', 'scheduled'],
  );
  assert.equal(evidence.latestScheduled?.id, 'scheduled');
  assert.equal(input[0]?.id, 'm1');
  for (const state of ['failed', 'active', 'waiting', 'delayed']) {
    const next = timingEvidence([...input, run('next', 6, true, state)]);
    assert.equal(next.latestScheduled?.state, state);
    assert.deepEqual(
      next.completed.map((item) => item.id),
      state === 'failed' ? ['m3', 'm2', 'm1'] : ['m3', 'm2', 'm1', 'scheduled'],
    );
    assert.equal(
      next.latestScheduledOutcome?.id,
      state === 'failed' ? 'next' : 'scheduled',
    );
    assert.equal(next.failed.length, state === 'failed' ? 1 : 0);
  }
  assert.equal(timingEvidence([scheduled]).completed.length, 1);
  assert.equal(timingEvidence(manuals).latestScheduled, null);
  assert.deepEqual(timingEvidence([]), {
    completed: [],
    latestScheduled: null,
    latestScheduledOutcome: null,
    failed: [],
  });
});

void test('partial timing reads retain other editions and unavailable job timing without exception content', async () => {
  const runs = ['first', 'missing', 'last'].map((id) => ({
    id,
    state: 'completed',
    attempts: 1,
    scheduledAt: '2026-11-03T15:00:00Z',
    startedAt: '2026-11-03T15:00:01Z',
    finishedAt: '2026-11-03T15:00:10Z',
    durationMs: 9000,
    editionId: id,
    skipped: null,
  }));
  const reads: string[] = [];
  const result = await collectTimingEvidence(runs, async (run) => {
    reads.push(run.id);
    if (run.id === 'missing') throw new Error('secret SQL/HTTP detail');
    return { editionId: run.editionId, cost: 10 };
  });
  assert.deepEqual(reads, ['first', 'missing', 'last']);
  assert.equal(result.complete, false);
  assert.deepEqual(
    result.runs.map((run) => run.editionId),
    ['first', 'last'],
  );
  assert.deepEqual(result.unavailable, [runs[1]]);
  assert.equal(JSON.stringify(result).includes('secret'), false);
  assert.equal(
    scheduledTiming(result.unavailable[0]).scheduledCompletionDelayMs,
    10000,
  );
  const allUnavailable = await collectTimingEvidence(runs, async () => {
    throw new Error('unavailable');
  });
  assert.equal(allUnavailable.complete, false);
  assert.equal(allUnavailable.unavailable.length, 3);
  assert.deepEqual(allUnavailable.runs, []);
  const complete = await collectTimingEvidence(runs, async (run) => run.id);
  assert.equal(complete.complete, true);
  assert.deepEqual(complete.runs, reads);
  assert.deepEqual(complete.unavailable, []);
  assert.deepEqual(await collectTimingEvidence([], async () => assert.fail()), {
    runs: [],
    unavailable: [],
    complete: true,
  });
});

void test('timing history validates options and selects scheduled runs before limiting reads', () => {
  assert.deepEqual(timingOptions([]), { limit: 3, scheduledOnly: false });
  assert.deepEqual(timingOptions(['--scheduled-only', '--limit', '20']), {
    limit: 20,
    scheduledOnly: true,
  });
  for (const args of [
    ['--limit'],
    ['--limit', '0'],
    ['--limit', '21'],
    ['--limit', '1.5'],
    ['--limit', '1e1'],
    ['--limit', '1', '--limit', '2'],
    ['--scheduled-only', '--scheduled-only'],
    ['--scheduled-only', 'false'],
    ['--unknown'],
  ])
    assert.throws(() => timingOptions(args));
  const runs = Array.from({ length: 30 }, (_, index) => ({
    id: `job-${index}`,
    state: index % 5 === 0 ? 'failed' : 'completed',
    attempts: 1,
    scheduledAt: index % 2 === 0 ? new Date(index * 1000).toISOString() : null,
    startedAt: new Date(index * 1000 + 100).toISOString(),
    finishedAt: new Date(index * 1000 + 200).toISOString(),
    durationMs: 100,
    editionId: index % 5 === 0 ? null : `edition-${index}`,
    skipped: null,
  }));
  const history = timingEvidence(
    runs,
    timingOptions(['--limit', '20', '--scheduled-only']),
  );
  assert.deepEqual(
    history.completed.map((run) => run.id),
    [
      'job-28',
      'job-26',
      'job-24',
      'job-22',
      'job-18',
      'job-16',
      'job-14',
      'job-12',
      'job-8',
      'job-6',
      'job-4',
      'job-2',
    ],
  );
  assert.deepEqual(
    history.failed.map((run) => run.id),
    ['job-20', 'job-10', 'job-0'],
  );
  const bounded = timingEvidence(
    runs,
    timingOptions(['--scheduled-only', '--limit', '1']),
  );
  assert.deepEqual(
    bounded.completed.map((run) => run.id),
    ['job-28'],
  );
  assert.deepEqual(
    bounded.failed.map((run) => run.id),
    ['job-20'],
  );
  const mixed = timingEvidence(runs, timingOptions(['--limit', '1']));
  assert.deepEqual(
    mixed.completed.map((run) => run.id),
    ['job-29', 'job-28'],
  );
  assert.equal(mixed.latestScheduled?.id, 'job-28');
  assert.equal(runs[0].id, 'job-0');
});

void test('post evidence distinguishes absent snapshots from empty selections', () => {
  assert.equal(selectedPostEvidence(undefined), null);
  assert.deepEqual(selectedPostEvidence([]), {
    counts: { x: 0, reddit: 0, bluesky: 0 },
    selections: [],
  });
});

void test('post evidence preserves platform counts and saved engagement without inferring virality', () => {
  const base = {
    externalId: 'fixture',
    url: 'https://x.com/example/status/123',
    author: 'example',
    authorUrl: 'https://x.com/example',
    publishedAt: '2026-11-03T12:00:00Z',
    text: 'Private fixture text',
    reasons: [],
  };
  const posts = [
    { ...base, platform: 'x', metrics: {} },
    { ...base, platform: 'x', metrics: { likes: 0 } },
    {
      ...base,
      platform: 'bluesky',
      url: 'https://bsky.app/profile/example/post/123',
      observedAt: '2026-11-03T13:00:00Z',
      metrics: { likes: 12, reposts: 3, replies: 1 },
    },
    {
      ...base,
      platform: 'reddit',
      title: 'Fixture',
      subreddit: 'example',
      thumbnail: null,
      externalUrl: null,
      observedAt: '2026-11-03T13:00:00Z',
      metrics: { score: 10, comments: 2, upvoteRatio: 0.9 },
    },
  ].map((post) => selectedSocialPostSchema.parse(post));
  const evidence = selectedPostEvidence(posts)!;
  assert.deepEqual(evidence.counts, { x: 2, reddit: 1, bluesky: 1 });
  assert.deepEqual(
    evidence.selections.map((post) => post.metrics),
    posts.map((post) => post.metrics),
  );
  assert.deepEqual(
    evidence.selections.map((post) => post.observedAt),
    [null, null, '2026-11-03T13:00:00Z', '2026-11-03T13:00:00Z'],
  );
  assert.equal(evidence.selections[2].url, posts[2].url);
  assert.equal(
    JSON.stringify(evidence).includes('Private fixture text'),
    false,
  );
});

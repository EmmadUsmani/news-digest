import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  evaluateTriageCap,
  recordedTriageCaps,
} from '../scripts/evaluate-triage-cap';

void test('recorded caps distinguish existing exclusions from new lost events', () => {
  const results = recordedTriageCaps();
  assert.equal(results.length, 15);
  for (const topic of ['NBA', 'World news & politics', 'Tech & AI']) {
    const rows = results.filter((row) => row.topic === topic);
    assert.equal(rows.length, 5);
    const baseline = rows.find((row) => row.cap === 200)!;
    assert.deepEqual(baseline.lostEvents, []);
    assert.equal(baseline.omittedByCap, 0);
    for (const row of rows) {
      assert.equal(
        row.baselineReachableEvents,
        baseline.baselineReachableEvents,
      );
      assert.deepEqual(
        row.baselineMissingEvents,
        baseline.baselineMissingEvents,
      );
      assert.ok(row.admitted <= row.cap);
    }
  }
  const nba = results.find((row) => row.topic === 'NBA' && row.cap === 20)!;
  assert.ok(nba.lostEvents.includes('Lakers ownership dispute'));
  assert.equal(nba.coldBatchesAfter, nba.coldBatchesBefore);
});

void test('cap evaluation keeps semantic recovery, exact window and deterministic ties', () => {
  const candidate = (
    id: string,
    publishedAt: string,
    title = 'New research launch',
  ) => ({
    id,
    publishedAt,
    title,
    url: `https://example.org/${id}`,
    excerpt: 'New research details',
    sources: ['Outlet'],
    points: 0,
  });
  const window = {
    topic: 'Synthetic',
    windowStart: '2026-11-01T00:00:00Z',
    windowEnd: '2026-11-02T00:00:00Z',
    relevancePolicy: {
      includeAny: ['required missing phrase'],
      excludeAny: ['forbidden'],
    },
    candidates: [
      candidate('b', '2026-11-01T00:00:00Z'),
      candidate('a', '2026-11-01T00:00:00Z'),
      candidate('end', '2026-11-02T00:00:00Z'),
      candidate('excluded', '2026-11-01T01:00:00Z', 'forbidden'),
    ],
    events: [
      { name: 'First', ids: ['a'] },
      { name: 'Second', ids: ['b'] },
      { name: 'Already excluded', ids: ['excluded'] },
    ],
  };
  const result = evaluateTriageCap(window, 1);
  assert.equal(result.baselineCandidates, 2);
  assert.deepEqual(result.lostEvents, ['Second']);
  assert.deepEqual(result.baselineMissingEvents, ['Already excluded']);
  assert.deepEqual(
    evaluateTriageCap(
      { ...window, candidates: [...window.candidates].reverse() },
      1,
    ),
    result,
  );
  assert.throws(() => evaluateTriageCap(window, 0), /cap/);
  assert.throws(
    () =>
      evaluateTriageCap(
        { ...window, events: [{ name: 'Unknown', ids: ['missing'] }] },
        1,
      ),
    /Missing/,
  );
});

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  evaluateIncrementalTriage,
  recordedIncrementalTriage,
} from '../scripts/evaluate-incremental-triage';

void test('recorded incremental replay reuses item cache across growing batches', async () => {
  const rows = await recordedIncrementalTriage();
  assert.equal(rows.length, 12);
  for (const row of rows) {
    assert.equal(row.repeatScoring, 0);
    assert.equal(row.totalScoredItems, row.candidates);
    assert.equal(row.preEditionItems + row.editionItems, row.candidates);
    assert.equal(row.wasteItems, null);
    const cold = rows.find(
      (r) => r.topic === row.topic && r.intervalHours === 24,
    )!;
    assert.ok(row.totalRequests >= cold.totalRequests);
    assert.ok(row.promptBytes >= cold.promptBytes);
    assert.ok(row.reservedOutputTokens > 0);
    if (row.intervalHours === 1)
      assert.ok(row.reservedOutputTokens > cold.reservedOutputTokens);
    if (row.intervalHours === 1)
      assert.ok(row.editionItems < cold.editionItems);
    if (row.intervalHours === 24) assert.equal(row.preEditionRequests, 0);
  }
});

void test('incremental replay leaves tick-boundary arrivals to the next pass', async () => {
  const candidate = (id: string, publishedAt: string) => ({
    id,
    publishedAt,
    title: id,
    excerpt: null,
    sources: [],
  });
  const window = {
    topic: 'Synthetic',
    windowStart: '2026-11-01T00:00:00Z',
    windowEnd: '2026-11-01T02:00:00Z',
    candidates: [
      candidate('start', '2026-11-01T00:00:00Z'),
      candidate('tick', '2026-11-01T01:00:00Z'),
      candidate('end', '2026-11-01T02:00:00Z'),
      candidate('old', '2026-10-31T23:59:59Z'),
    ],
  };
  const row = await evaluateIncrementalTriage(window, 1);
  assert.equal(row.preEditionItems, 1);
  assert.equal(row.editionItems, 1);
  assert.equal(row.candidates, 2);
  assert.equal(row.repeatScoring, 0);
  await assert.rejects(evaluateIncrementalTriage(window, 0), /Interval/);
  await assert.rejects(
    evaluateIncrementalTriage({ ...window, windowEnd: 'invalid' }, 1),
    /window/,
  );
  await assert.rejects(
    evaluateIncrementalTriage(
      { ...window, candidates: [window.candidates[0], window.candidates[0]] },
      1,
    ),
    /candidates/,
  );
});

void test('arrival and pool replay counts waste, late arrivals and returning cached items', async () => {
  const candidate = (id: string, availableAt: string) => ({
    id,
    availableAt,
    publishedAt: '2026-11-01T00:00:00Z',
    title: id,
    excerpt: null,
    sources: [],
  });
  const window = {
    topic: 'Synthetic arrivals',
    windowStart: '2026-11-01T00:00:00Z',
    windowEnd: '2026-11-01T04:00:00Z',
    candidates: [
      candidate('returning', '2026-11-01T00:30:00Z'),
      candidate('discarded', '2026-11-01T00:30:00Z'),
      candidate('late', '2026-11-01T03:30:00Z'),
      candidate('missed', '2026-11-01T04:00:00Z'),
    ],
    poolSnapshots: [
      { at: '2026-11-01T00:00:00Z', candidateIds: ['returning', 'discarded'] },
      { at: '2026-11-01T02:00:00Z', candidateIds: [] },
      {
        at: '2026-11-01T03:00:00Z',
        candidateIds: ['returning', 'late', 'missed'],
      },
    ],
  };
  const row = await evaluateIncrementalTriage(window, 1);
  assert.equal(row.availability, 'recorded-arrival');
  assert.equal(row.candidates, 2);
  assert.equal(row.preEditionItems, 2);
  assert.equal(row.editionItems, 1);
  assert.equal(row.totalScoredItems, 3);
  assert.equal(row.repeatScoring, 0);
  assert.equal(row.wasteItems, 1);
  assert.equal(row.unavailableAtEdition, 1);
  const cold = await evaluateIncrementalTriage(window, 24);
  assert.equal(cold.totalScoredItems, 2);
  assert.equal(cold.wasteItems, 0);
  for (const poolSnapshots of [
    [],
    [...window.poolSnapshots].reverse(),
    [{ at: window.windowStart, candidateIds: ['unknown'] }],
    [{ at: window.windowStart, candidateIds: ['late', 'late'] }],
  ])
    await assert.rejects(
      evaluateIncrementalTriage({ ...window, poolSnapshots }, 1),
      /snapshots/,
    );
  await assert.rejects(
    evaluateIncrementalTriage(
      {
        ...window,
        candidates: [{ ...window.candidates[0], availableAt: undefined }],
      },
      1,
    ),
    /snapshots/,
  );
  for (const availableAt of ['invalid', '2026-10-31T23:00:00Z'])
    await assert.rejects(
      evaluateIncrementalTriage(
        {
          ...window,
          candidates: window.candidates.map((c) => ({ ...c, availableAt })),
        },
        1,
      ),
      /arrival/,
    );
  await assert.rejects(
    evaluateIncrementalTriage(
      {
        ...window,
        candidates: window.candidates.map((c, i) => ({
          ...c,
          availableAt: i ? c.availableAt : undefined,
        })),
      },
      1,
    ),
    /arrival/,
  );
});

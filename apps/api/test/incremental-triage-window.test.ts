import assert from 'node:assert/strict';
import { test } from 'node:test';

import { incrementalTriageWindow } from '../src/modules/profiles/adapters/incremental-triage-window';

const schedule = {
  cadence: '0 7 * * *',
  timezone: 'America/Los_Angeles',
  coverageWindow: 'P1D',
  storyBudget: 5,
  postBudget: 5,
};

void test('background window matches publication and retains exact slot cutoff', () => {
  const slot = '2026-11-04T15:00:00.000Z';
  for (const time of ['2026-11-04T02:00:00Z', slot]) {
    const window = incrementalTriageWindow(schedule, new Date(time));
    assert.equal(window.windowEnd.toISOString(), slot);
    assert.equal(window.windowStart.toISOString(), '2026-11-03T15:00:00.000Z');
    assert.equal(window.nextEditionAt, Date.parse(slot));
    assert.equal(window.cutoffMs, 7_200_000);
  }
  assert.equal(
    incrementalTriageWindow(
      schedule,
      new Date(Date.parse(slot) + 1),
    ).windowEnd.toISOString(),
    '2026-11-05T15:00:00.000Z',
  );
});

void test('rereads changed settings and uses elapsed coverage across DST', () => {
  const now = new Date('2026-11-01T01:00:00Z');
  const window = incrementalTriageWindow(schedule, now);
  assert.equal(window.windowEnd.toISOString(), '2026-11-01T15:00:00.000Z');
  assert.equal(window.windowStart.toISOString(), '2026-10-31T15:00:00.000Z');
  const changed = incrementalTriageWindow(
    {
      ...schedule,
      timezone: 'UTC',
      cadence: '30 8 * * *',
      coverageWindow: 'PT6H',
    },
    now,
  );
  assert.equal(changed.windowEnd.toISOString(), '2026-11-01T08:30:00.000Z');
  assert.equal(changed.windowStart.toISOString(), '2026-11-01T02:30:00.000Z');
});

void test('invalid time or schedule fails closed', () => {
  assert.throws(() => incrementalTriageWindow(schedule, new Date(NaN)));
  for (const patch of [
    { cadence: 'broken' },
    { timezone: 'Invalid/Zone' },
    { coverageWindow: 'P0D' },
  ])
    assert.throws(() =>
      incrementalTriageWindow({ ...schedule, ...patch }, new Date()),
    );
});

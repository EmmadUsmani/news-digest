import assert from 'node:assert/strict';
import { test } from 'node:test';

import { scheduledTiming } from '../../../scripts/lib/scheduled-timing';

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

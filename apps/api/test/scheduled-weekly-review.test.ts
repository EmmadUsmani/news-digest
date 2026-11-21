import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  runScheduledWeeklyReview,
  weeklySchedule,
} from '../src/modules/digests/application/scheduled-weekly-review';
import { dispatchWeeklyReview } from '../src/scheduled-weekly';

const timestamp = Date.parse('2026-11-22T17:00:00Z');
const request = {
  timestamp,
  now: timestamp,
  id: 'attempt',
  topics: [{ id: 'tech', name: 'Tech' }],
};

void test('weekly retries keep original public scope, coverage and generation key', async () => {
  const requests: Parameters<
    Parameters<typeof runScheduledWeeklyReview>[0]
  >[0][] = [];
  const generate: Parameters<typeof runScheduledWeeklyReview>[0] = async (
    input,
  ) => {
    requests.push(input);
    return {
      ...input,
      id: 'saved',
      kind: 'weekly',
      windowStart: '2026-11-15T17:00:00Z',
      windowEnd: input.scheduledAt,
      topics: [],
    };
  };
  assert.deepEqual(weeklySchedule, { pattern: '0 17 * * 0', tz: 'UTC' });
  for (const delay of [0, 60_000, 6 * 3600_000]) {
    assert.deepEqual(
      await runScheduledWeeklyReview(generate, {
        ...request,
        id: `attempt-${delay}`,
        now: timestamp + delay,
      }),
      { editionId: 'saved', windowEnd: '2026-11-22T17:00:00.000Z' },
    );
  }
  assert.equal(new Set(requests.map((input) => input.generationKey)).size, 1);
  assert.equal(
    requests[0].generationKey,
    'weekly:public:2026-11-22T17:00:00.000Z',
  );
  assert.ok(
    requests.every(
      (input) =>
        input.profileId === null &&
        input.scheduledAt === requests[0].scheduledAt,
    ),
  );
});

void test('invalid, early and stale slots never dispatch weekly generation', async () => {
  const generate = async (): Promise<never> => {
    throw new Error('must not dispatch');
  };
  for (const value of [
    undefined,
    NaN,
    timestamp + 1,
    timestamp - 3600_000,
    timestamp - 86400_000,
  ])
    await assert.rejects(
      runScheduledWeeklyReview(generate, { ...request, timestamp: value }),
      /slot|timestamp|future/i,
    );
  const result = await runScheduledWeeklyReview(generate, {
    ...request,
    now: timestamp + 6 * 3600_000 + 1,
  });
  assert.match(result.skipped!, /six hours late/);
});

void test('missing daily or refused editing remains a retryable failure', async () => {
  await assert.rejects(
    runScheduledWeeklyReview(async () => null, request),
    /daily prerequisite or editor refused/,
  );
  await assert.rejects(
    runScheduledWeeklyReview(async () => {
      throw new Error('storage unavailable');
    }, request),
    /storage unavailable/,
  );
});

void test('queue dispatch uses original slot and fresh UUID with stable publication key', async () => {
  const requests: Parameters<Parameters<typeof dispatchWeeklyReview>[1]>[0][] =
    [];
  for (const delay of [0, 300_000])
    await dispatchWeeklyReview(
      { opts: { prevMillis: timestamp } },
      async (input) => {
        requests.push(input);
        return {
          ...input,
          kind: 'weekly',
          windowStart: '2026-11-15T17:00:00Z',
          windowEnd: input.scheduledAt,
          topics: [],
        };
      },
      request.topics,
      timestamp + delay,
    );
  assert.match(requests[0].id, /^[0-9a-f-]{36}$/);
  assert.notEqual(requests[0].id, requests[1].id);
  assert.equal(requests[0].generationKey, requests[1].generationKey);
  await assert.rejects(
    dispatchWeeklyReview(
      { opts: {} },
      async () => {
        throw new Error('must not dispatch');
      },
      request.topics,
      timestamp,
    ),
    /timestamp/i,
  );
});

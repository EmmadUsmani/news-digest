import assert from 'node:assert/strict';
import { test } from 'node:test';

import type { ProfileSettings } from '@digest/contracts';

import { runScheduledXSearch } from '../src/scheduled-x-search';

const profile = {
  id: 'owner',
  schedule: {
    cadence: '0 15 * * *',
    timezone: 'UTC',
    coverageWindow: 'P1D',
    storyBudget: 5,
    postBudget: 5,
  },
} as ProfileSettings;
const candidates = [
  { id: 'nba', name: 'NBA', guidance: '', handles: ['NBA'], freePosts: 0 },
];
void test('scheduled X tick uses saved timezone, scarce topic and durable day identity', async () => {
  const result = await runScheduledXSearch(
    async () => ({
      ...profile,
      schedule: {
        ...profile.schedule,
        cadence: '0 7 * * *',
        timezone: 'America/Los_Angeles',
      },
    }),
    async () => candidates,
    async (plan, runId) => {
      assert.equal(plan.topic.id, 'nba');
      assert.equal(plan.scheduledDay, '2026-11-03');
      assert.equal(
        runId,
        `scheduled-x:owner:${Date.parse('2026-11-03T15:00:00Z')}`,
      );
      return 'executed';
    },
    () => new Date('2026-11-03T14:30:00Z'),
  );
  assert.equal(result, 'executed');
});
void test('scheduled X tick rejects replaced settings and delayed coverage reads', async () => {
  let reads = 0;
  let calls = 0;
  const execute = async () => {
    calls++;
  };
  assert.deepEqual(
    await runScheduledXSearch(
      async () =>
        ++reads === 1
          ? profile
          : {
              ...profile,
              schedule: { ...profile.schedule, cadence: '0 16 * * *' },
            },
      async () => candidates,
      execute,
      () => new Date('2026-11-03T14:30:00Z'),
    ),
    { skipped: 'Schedule changed' },
  );
  let ticks = 0;
  await runScheduledXSearch(
    async () => profile,
    async () => candidates,
    execute,
    () =>
      new Date(++ticks === 1 ? '2026-11-03T14:30:00Z' : '2026-11-03T14:56:00Z'),
  );
  assert.equal(calls, 0);
});
void test('midnight edition spends only on its own UTC day and skips missed/disabled windows', async () => {
  const midnight = {
    ...profile,
    schedule: { ...profile.schedule, cadence: '10 0 * * *' },
  };
  let calls = 0;
  let topicReads = 0;
  const topics = async () => {
    topicReads++;
    return candidates;
  };
  const execute = async (plan: { scheduledDay: string }) => {
    calls++;
    assert.equal(plan.scheduledDay, '2026-11-04');
  };
  for (const stamp of ['2026-11-03T23:45:00Z', '2026-11-04T00:06:00Z'])
    await runScheduledXSearch(
      async () => midnight,
      topics,
      execute,
      () => new Date(stamp),
    );
  assert.equal(calls, 0);
  assert.equal(topicReads, 0);
  await runScheduledXSearch(
    async () => midnight,
    topics,
    execute,
    () => new Date('2026-11-04T00:00:00Z'),
  );
  assert.equal(calls, 1);
  await runScheduledXSearch(
    async () => ({
      ...midnight,
      schedule: { ...midnight.schedule, postBudget: 0 },
    }),
    topics,
    execute,
    () => new Date('2026-11-04T00:01:00Z'),
  );
  assert.equal(calls, 1);
});

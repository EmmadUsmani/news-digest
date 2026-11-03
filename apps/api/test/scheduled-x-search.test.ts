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
void test('open scheduled discovery covers topics without valid curated handles, weakest first', async () => {
  const order: string[] = [];
  const runIds: string[] = [];
  await runScheduledXSearch(
    async () => profile,
    async () => [
      { ...candidates[0], id: 'listed', freePosts: 2 },
      { ...candidates[0], id: 'empty', handles: [] },
      { ...candidates[0], id: 'invalid', handles: ['@invalid'], freePosts: 1 },
      { ...candidates[0], id: 'bad-coverage', handles: [], freePosts: -1 },
    ],
    async (plan, runId) => {
      order.push(plan.topic.id);
      runIds.push(runId);
      assert.equal(Object.hasOwn(plan.request, 'handles'), false);
      assert.equal(plan.request.topic, 'NBA');
      assert.equal(plan.scheduledDay, '2026-11-03');
    },
    () => new Date('2026-11-03T14:30:00Z'),
    'open-topic',
  );
  assert.deepEqual(order, ['empty', 'invalid', 'listed']);
  assert.equal(new Set(runIds).size, 1);
  assert.equal(
    runIds[0],
    `scheduled-x:owner:${Date.parse('2026-11-03T15:00:00Z')}`,
  );
});

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
  assert.deepEqual(result, ['executed']);
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
    { skipped: 'Schedule changed', results: [] },
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

void test('scheduled X searches every topic weakest-first with stable ties, even after a blocked result', async () => {
  const order: string[] = [];
  await runScheduledXSearch(
    async () => profile,
    async () => [
      { ...candidates[0], id: 'strong', freePosts: 9 },
      { ...candidates[0], id: 'weak' },
      { ...candidates[0], id: 'tie' },
      { ...candidates[0], id: 'middle', freePosts: 3 },
    ],
    async (plan) => {
      order.push(plan.topic.id);
      return { state: 'budget-blocked' };
    },
    () => new Date('2026-11-03T14:30:00Z'),
  );
  assert.deepEqual(order, ['weak', 'tie', 'middle', 'strong']);
});

void test('a slow first search prevents later topics from spending after the window', async () => {
  let calls = 0;
  await runScheduledXSearch(
    async () => profile,
    async () => [candidates[0], { ...candidates[0], id: 'second' }],
    async () => {
      calls++;
    },
    () => new Date(calls ? '2026-11-03T14:56:00Z' : '2026-11-03T14:30:00Z'),
  );
  assert.equal(calls, 1);
});

void test('topic edits during a search stop stale paid plans in either search mode', async () => {
  for (const mode of ['account-list', 'open-topic'] as const) {
    for (const change of [
      'disable',
      'add',
      'handles',
      'guidance',
      'name',
    ] as const) {
      let calls = 0;
      const original = [candidates[0], { ...candidates[0], id: 'second' }];
      const result = await runScheduledXSearch(
        async () => profile,
        async () => {
          const current = structuredClone(original);
          if (!calls) return current;
          if (change === 'disable') return current.slice(0, 1);
          if (change === 'add')
            return [...current, { ...current[0], id: 'new' }];
          if (change === 'handles') current[1].handles = ['Changed'];
          if (change === 'guidance')
            current[1].guidance = 'Changed topic intent';
          if (change === 'name') current[1].name = 'Changed name';
          return current;
        },
        async () => {
          calls++;
          return 'executed';
        },
        () => new Date('2026-11-03T14:30:00Z'),
        mode,
      );
      assert.equal(calls, 1, `${mode}: ${change}`);
      assert.deepEqual(result, {
        skipped: 'Topics changed',
        results: ['executed'],
      });
    }
  }
});

void test('coverage updates do not invalidate scheduled discovery', async () => {
  let reads = 0;
  let calls = 0;
  await runScheduledXSearch(
    async () => profile,
    async () => [
      { ...candidates[0], freePosts: reads++ },
      { ...candidates[0], id: 'second', freePosts: reads },
    ],
    async () => {
      calls++;
    },
    () => new Date('2026-11-03T14:30:00Z'),
  );
  assert.equal(calls, 2);
});

void test('topic recheck latency cannot bypass the search window or schedule guard', async () => {
  for (const changed of ['time', 'schedule'] as const) {
    let reads = 0;
    let calls = 0;
    const result = await runScheduledXSearch(
      async () =>
        reads > 1 && changed === 'schedule'
          ? { ...profile, schedule: { ...profile.schedule, postBudget: 0 } }
          : profile,
      async () => {
        reads++;
        return candidates;
      },
      async () => {
        calls++;
      },
      () =>
        new Date(
          reads > 1 && changed === 'time'
            ? '2026-11-03T14:56:00Z'
            : '2026-11-03T14:30:00Z',
        ),
    );
    assert.equal(calls, 0);
    if (changed === 'schedule')
      assert.deepEqual(result, { skipped: 'Schedule changed', results: [] });
  }
});

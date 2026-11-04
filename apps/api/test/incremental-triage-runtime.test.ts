import assert from 'node:assert/strict';
import test from 'node:test';

import type { Pool } from 'pg';

import { prepareIncrementalTriageRuntime } from '../src/incremental-triage-runtime';
import { IncrementalTriageScheduler } from '../src/modules/curation/application/incremental-triage-scheduler';

void test('default-off runtime allocates no timer and touches no database or settings', async () => {
  const stop = prepareIncrementalTriageRuntime(
    {
      db: new Proxy({} as Pool, {
        get: () => assert.fail('database accessed while disabled'),
      }),
      settings: () => assert.fail('settings read while disabled'),
      onError: () => assert.fail('unexpected error'),
      everyMs: 1000,
      env: {},
    },
    undefined,
    () => assert.fail('timer allocated while disabled'),
  );
  await stop();
  await stop();
});

void test('runtime composes once, passes current settings and returns timer drain', async () => {
  const db = {} as Pool;
  const env = {};
  let compositions = 0;
  let reads = 0;
  let ticks = 0;
  let stopped = false;
  const errors: unknown[] = [];
  const onError = (error: unknown) => errors.push(error);
  const stop = prepareIncrementalTriageRuntime(
    {
      db,
      env,
      everyMs: 1234,
      onError,
      settings: async () => {
        reads++;
        return {
          schedule: {
            cadence: '0 15 * * *',
            timezone: 'UTC',
            coverageWindow: 'PT24H',
            storyBudget: 5,
            postBudget: 5,
          },
          topicIds: [],
        };
      },
    },
    (actualDb, schedule, actualEnv) => {
      compositions++;
      assert.equal(actualDb, db);
      assert.equal(actualEnv, env);
      const scheduler = new IncrementalTriageScheduler(
        { run: () => assert.fail('no topics should be scored') },
        { minimumPending: 1, maximumItems: 25 },
      );
      const original = scheduler.tick.bind(scheduler);
      scheduler.tick = (topics) => {
        ticks++;
        assert.ok(Number.isFinite(schedule().nextEditionAt));
        return original(topics);
      };
      return scheduler;
    },
    (options) => {
      assert.equal(options.everyMs, 1234);
      options.onError(new Error('reported'));
      return async () => {
        await options.tick();
        await options.tick();
        stopped = true;
      };
    },
  );
  assert.equal(reads, 0);
  await stop();
  assert.equal(compositions, 1);
  assert.equal(reads, 2);
  assert.equal(ticks, 2);
  assert.equal(stopped, true);
  assert.equal(errors.length, 1);
});

import assert from 'node:assert/strict';
import test from 'node:test';

import type { Pool } from 'pg';

import { prepareIncrementalTriageWorker } from '../src/incremental-triage-worker';

const onError = () => assert.fail('unexpected timer error');
const enabled = { LLM_INCREMENTAL_TRIAGE_ENABLED: '1' };
function resources(close: () => Promise<void>) {
  return {
    db: {} as Pool,
    settings: async () => ({
      schedule: {
        cadence: '0 7 * * *',
        timezone: 'America/Los_Angeles',
        coverageWindow: 'P1D',
        storyBudget: 5,
        postBudget: 5,
      },
      topicIds: [],
    }),
    close,
  };
}

void test('disabled and invalid gates allocate no worker resources', async () => {
  const allocate = () => assert.fail('resources allocated');
  const stop = await prepareIncrementalTriageWorker(onError, {}, allocate);
  await stop();
  await assert.rejects(
    prepareIncrementalTriageWorker(
      onError,
      { LLM_INCREMENTAL_TRIAGE_ENABLED: 'true' },
      allocate,
    ),
    /Invalid/,
  );
});

void test('worker forwards settings and drains once before releasing resources', async () => {
  const events: string[] = [];
  let release!: () => void;
  const drain = new Promise<void>((resolve) => {
    release = resolve;
  });
  const owned = resources(async () => {
    events.push('closed');
  });
  const stop = await prepareIncrementalTriageWorker(
    onError,
    enabled,
    () => owned,
    (deps) => {
      assert.equal(deps.db, owned.db);
      assert.equal(deps.env, enabled);
      assert.equal(deps.everyMs, 60_000);
      return async () => {
        assert.deepEqual(await deps.settings(), await owned.settings());
        events.push('draining');
        await drain;
        events.push('drained');
      };
    },
  );
  const first = stop();
  assert.equal(stop(), first);
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.deepEqual(events, ['draining']);
  release();
  await first;
  await stop();
  assert.deepEqual(events, ['draining', 'drained', 'closed']);
});

void test('worker closes owned resources on composition failure and preserves both errors', async () => {
  const startup = new Error('invalid reserve');
  const cleanup = new Error('close failed');
  let closed = 0;
  const owned = resources(async () => {
    closed++;
    throw cleanup;
  });
  await assert.rejects(
    prepareIncrementalTriageWorker(
      onError,
      enabled,
      () => owned,
      () => {
        throw startup;
      },
    ),
    (error: unknown) => {
      assert.ok(error instanceof AggregateError);
      assert.deepEqual(error.errors, [startup, cleanup]);
      return true;
    },
  );
  assert.equal(closed, 1);
});

void test('failed drain leaves database open and repeated stops share the failure', async () => {
  const failure = new Error('drain failed');
  const stop = await prepareIncrementalTriageWorker(
    onError,
    enabled,
    () => resources(async () => assert.fail('closed before drain')),
    () => async () => {
      throw failure;
    },
  );
  const pending = stop();
  assert.equal(stop(), pending);
  await assert.rejects(pending, (error) => error === failure);
});

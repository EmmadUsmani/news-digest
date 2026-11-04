import assert from 'node:assert/strict';
import test from 'node:test';

import { prepareIncrementalTriageTimer } from '../src/incremental-triage-timer';

void test('timer avoids overlap and shutdown drains active work without another tick', async (t) => {
  t.mock.timers.enable({ apis: ['setInterval'] });
  let calls = 0;
  let release!: () => void;
  const stop = prepareIncrementalTriageTimer({
    everyMs: 1000,
    tick: async () => {
      calls++;
      await new Promise<void>((resolve) => {
        release = resolve;
      });
    },
    onError: () => assert.fail('unexpected error'),
  });
  assert.equal(calls, 0);
  t.mock.timers.tick(1000);
  await Promise.resolve();
  t.mock.timers.tick(5000);
  assert.equal(calls, 1);
  let drained = false;
  const stopping = stop().then(() => {
    drained = true;
  });
  await Promise.resolve();
  assert.equal(drained, false);
  release();
  await stopping;
  assert.equal(drained, true);
  t.mock.timers.tick(5000);
  assert.equal(calls, 1);
  await stop();
});

void test('timer reports failed ticks and recovers on the next interval', async (t) => {
  t.mock.timers.enable({ apis: ['setInterval'] });
  const failure = new Error('offline tick failed');
  const errors: unknown[] = [];
  let calls = 0;
  const stop = prepareIncrementalTriageTimer({
    everyMs: 1000,
    tick: async () => {
      if (++calls === 1) throw failure;
    },
    onError: (error) => errors.push(error),
  });
  t.mock.timers.tick(1000);
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.deepEqual(errors, [failure]);
  t.mock.timers.tick(1000);
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(calls, 2);
  await stop();
});

void test('timer rejects invalid intervals before installing background work', () => {
  for (const everyMs of [0, -1, NaN, Infinity, 0.5, 2_147_483_648])
    assert.throws(() =>
      prepareIncrementalTriageTimer({
        everyMs,
        tick: async () => undefined,
        onError: () => undefined,
      }),
    );
});

void test('shutdown observes an error-reporter failure without an unhandled rejection', async (t) => {
  t.mock.timers.enable({ apis: ['setInterval'] });
  const reportingFailure = new Error('reporting failed');
  const stop = prepareIncrementalTriageTimer({
    everyMs: 1000,
    tick: async () => {
      throw new Error('tick failed');
    },
    onError: () => {
      throw reportingFailure;
    },
  });
  t.mock.timers.tick(1000);
  await Promise.resolve();
  await assert.rejects(stop(), reportingFailure);
});

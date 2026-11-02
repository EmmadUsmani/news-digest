import assert from 'node:assert/strict';
import { test } from 'node:test';

import { parallelTopics } from '../src/modules/digests/application/parallel-topics';

void test('topic workers bound concurrency and retain order across multiple waves', async () => {
  let active = 0;
  let peak = 0;
  const results = await parallelTopics(
    Array.from({ length: 11 }, (_, i) => i),
    async (i) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, (11 - i) * 2));
      active--;
      return i;
    },
  );
  assert.equal(peak, 4);
  assert.deepEqual(
    results,
    Array.from({ length: 11 }, (_, i) => i),
  );
  assert.deepEqual(await parallelTopics([], async () => 0), []);
});

void test('failed topic drains siblings and stops queued topics before rejecting', async () => {
  const started: number[] = [];
  const finished: number[] = [];
  const failure = new Error('editor failed');
  await assert.rejects(
    parallelTopics([0, 1, 2, 3, 4, 5], async (i) => {
      started.push(i);
      if (i === 0) throw failure;
      await new Promise((resolve) => setTimeout(resolve, 10));
      finished.push(i);
      return i;
    }),
    (error) => error === failure,
  );
  assert.deepEqual(started, [0, 1, 2, 3]);
  assert.deepEqual(finished, [1, 2, 3]);
});

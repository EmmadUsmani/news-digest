import assert from 'node:assert/strict';
import { test } from 'node:test';

import { InferenceSlots } from '../src/modules/curation/adapters/inference-slots';
import { InferenceAdmission } from '../src/modules/curation/application/inference-admission';

void test('fifteen multi-topic calls reach provider slots despite slow responses', async () => {
  const admission = new InferenceAdmission(4, 64, 2000);
  const provider = new InferenceSlots(4, 10);
  let active = 0;
  let peak = 0;
  const dispatched: number[] = [];
  const outcomes = await Promise.all(
    Array.from({ length: 15 }, (_, id) =>
      admission.run(() =>
        provider.run(async () => {
          dispatched.push(id);
          peak = Math.max(peak, ++active);
          await new Promise((resolve) => setTimeout(resolve, 25));
          active--;
          return id;
        }),
      ),
    ),
  );
  assert.deepEqual(
    outcomes,
    Array.from({ length: 15 }, (_, id) => id),
  );
  assert.deepEqual(dispatched, outcomes);
  assert.equal(peak, 4);
  assert.equal(await admission.run(async () => 'reused'), 'reused');
});

void test('bounded admission expires queued work, drains exceptions, and reuses slots', async () => {
  const admission = new InferenceAdmission(1, 1, 1000);
  let release!: () => void;
  const first = admission.run(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  let dispatched = false;
  const expired = admission.run(async () => {
    dispatched = true;
  }, 10);
  assert.equal(await admission.run(async () => 'overflow'), undefined);
  assert.equal(await expired, undefined);
  assert.equal(dispatched, false);
  release();
  await first;
  await assert.rejects(
    admission.run(async () => {
      throw new Error('failed');
    }),
    /failed/,
  );
  assert.equal(await admission.run(async () => 'reused'), 'reused');
  assert.equal(await admission.run(async () => 'expired', 0), undefined);
});

void test('late transfer never dispatches work after its admission deadline', async () => {
  let now = 0;
  const admission = new InferenceAdmission(1, 1, 1000, () => now);
  let release!: () => void;
  const first = admission.run(
    () =>
      new Promise<void>((resolve) => {
        release = resolve;
      }),
  );
  let dispatched = false;
  const next = admission.run(async () => {
    dispatched = true;
  }, 20);
  now = 21;
  release();
  await first;
  assert.equal(await next, undefined);
  assert.equal(dispatched, false);
  assert.equal(await admission.run(async () => 'reused'), 'reused');
});

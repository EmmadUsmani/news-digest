import assert from 'node:assert/strict';
import { test } from 'node:test';

import { IncrementalTriageRunner } from '../src/modules/curation/application/incremental-triage-runner';
import type { TriageCandidate } from '../src/modules/curation/application/triage';

const options = { minimumPending: 1, maximumItems: 25 };
const input = {
  topic: { id: 'topic', name: 'Topic', description: '', guidance: '' },
  candidates: [{ id: 'article', title: 'Title', excerpt: null, sources: [] }],
  runId: 'background',
};
const load = () => Promise.resolve(input);
const refused = async (_topic: unknown, candidates: TriageCandidate[]) => ({
  scores: [],
  unscoredIds: candidates.map((c) => c.id),
});

void test('runner skips overlapping topics without loading stale pools and releases after success', async () => {
  let release!: () => void;
  const blocked = new Promise<void>((resolve) => {
    release = resolve;
  });
  let calls = 0;
  const runner = new IncrementalTriageRunner(
    {
      pending: async (_topic, candidates) => candidates,
      score: async (...args) => {
        calls++;
        await blocked;
        return refused(...args);
      },
    },
    () => ({ nextEditionAt: 1000, cutoffMs: 100 }),
    () => 0,
  );
  const first = runner.run(load, options);
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(calls, 1);
  assert.deepEqual(
    await runner.run(() => {
      throw new Error('loaded overlap');
    }, options),
    { status: 'busy' },
  );
  release();
  assert.equal((await first).status, 'completed');
  assert.equal((await runner.run(load, options)).status, 'completed');
  assert.equal(calls, 2);
});

void test('runner excludes exact cutoff before loading and rechecks after async pool and cache reads', async () => {
  let now = 900;
  let edition = 1000;
  let scores = 0;
  let onProbe = () => {};
  const runner = new IncrementalTriageRunner(
    {
      pending: async (_topic, candidates) => {
        onProbe();
        return candidates;
      },
      score: async (...args) => {
        scores++;
        return refused(...args);
      },
    },
    () => ({ nextEditionAt: edition, cutoffMs: 100 }),
    () => now,
  );
  assert.deepEqual(
    await runner.run(() => {
      throw new Error('loaded cutoff');
    }, options),
    { status: 'cutoff' },
  );
  now = 899;
  assert.equal(
    (
      await runner.run(async () => {
        now = 900;
        return input;
      }, options)
    ).status,
    'cutoff',
  );
  now = 899;
  onProbe = () => {
    edition = 999;
  };
  const result = await runner.run(load, options);
  assert.equal(result.status, 'cutoff');
  assert.deepEqual(result.result?.unscoredIds, ['article']);
  assert.equal(scores, 0);
  // Refused cutoff work remains available to a future permissible pass.
  edition = 2000;
  onProbe = () => {};
  assert.equal((await runner.run(load, options)).status, 'completed');
  assert.equal(scores, 1);
});

void test('runner releases admission after loader, cache, provider and configuration failures', async () => {
  let fail: string | undefined;
  const runner = new IncrementalTriageRunner(
    {
      pending: async (_topic, candidates) => {
        if (fail === 'cache') throw new Error(fail);
        return candidates;
      },
      score: async (...args) => {
        if (fail === 'provider') throw new Error(fail);
        return refused(...args);
      },
    },
    () => ({ nextEditionAt: fail === 'config' ? NaN : 1000, cutoffMs: 100 }),
    () => 0,
  );
  for (const failure of ['loader', 'cache', 'provider', 'config']) {
    fail = failure;
    await assert.rejects(
      runner.run(async () => {
        if (fail === 'loader') throw new Error(fail);
        return input;
      }, options),
    );
    fail = undefined;
    assert.equal((await runner.run(load, options)).status, 'completed');
  }
});

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

void test('shared admission rechecks cutoff and recovers from acquire and release errors', async () => {
  let now = 0;
  let mode = 'acquire-error';
  let releases = 0;
  const runner = new IncrementalTriageRunner(
    { pending: async (_topic, candidates) => candidates, score: refused },
    () => ({ nextEditionAt: 1000, cutoffMs: 100 }),
    () => now,
    {
      acquire: async () => {
        if (mode === 'acquire-error') throw new Error('acquire failed');
        if (mode === 'cutoff') now = 900;
        return async () => {
          releases++;
          if (mode === 'release-error') throw new Error('release failed');
        };
      },
    },
  );
  await assert.rejects(runner.run(load, options), /acquire failed/);
  mode = 'cutoff';
  assert.deepEqual(
    await runner.run(async () => {
      throw new Error('loaded after admission crossed cutoff');
    }, options),
    { status: 'cutoff' },
  );
  assert.equal(releases, 1);
  now = 0;
  mode = 'release-error';
  await assert.rejects(runner.run(load, options), /release failed/);
  mode = 'success';
  assert.equal((await runner.run(load, options)).status, 'completed');
  assert.equal(releases, 3);
});

void test('runner preserves work and cleanup failures together and permits the next tick', async () => {
  for (const stage of ['loader', 'cache', 'provider']) {
    // Even a falsy thrown value must survive cleanup failure.
    for (const original of [new Error(stage), undefined]) {
      const cleanupError = new Error('session lost');
      let failing = true;
      let releases = 0;
      const runner = new IncrementalTriageRunner(
        {
          pending: async (_topic, candidates) => {
            if (failing && stage === 'cache') {
              // eslint-disable-next-line @typescript-eslint/only-throw-error -- exercise non-Error failures from dependencies
              throw original;
            }
            return candidates;
          },
          score: async (...args) => {
            if (failing && stage === 'provider') {
              // eslint-disable-next-line @typescript-eslint/only-throw-error -- exercise non-Error failures from dependencies
              throw original;
            }
            return refused(...args);
          },
        },
        () => ({ nextEditionAt: 1000, cutoffMs: 100 }),
        () => 0,
        {
          acquire: async () => async () => {
            releases++;
            if (failing) throw cleanupError;
          },
        },
      );
      await assert.rejects(
        runner.run(async () => {
          if (stage === 'loader') {
            // eslint-disable-next-line @typescript-eslint/only-throw-error -- exercise non-Error failures from dependencies
            throw original;
          }
          return input;
        }, options),
        (error) => {
          assert.ok(error instanceof AggregateError);
          assert.deepEqual(error.errors, [original, cleanupError]);
          return true;
        },
      );
      failing = false;
      assert.equal((await runner.run(load, options)).status, 'completed');
      assert.equal(releases, 2);
    }
  }
});

void test('cache scan crossing cutoff skips later chunks and releases admission', async () => {
  let now = 0;
  let reads = 0;
  let releases = 0;
  const runner = new IncrementalTriageRunner(
    {
      pending: async () => {
        reads++;
        now = 900;
        return [];
      },
      score: async () => assert.fail('scored after cutoff'),
    },
    () => ({ nextEditionAt: 1000, cutoffMs: 100 }),
    () => now,
    {
      acquire: async () => async () => {
        releases++;
      },
    },
  );
  const candidates = Array.from({ length: 601 }, (_, id) => ({
    ...input.candidates[0],
    id: String(id),
  }));
  const result = await runner.run(
    async () => ({ ...input, candidates }),
    options,
  );
  assert.equal(result.status, 'cutoff');
  assert.equal(reads, 1);
  assert.equal(releases, 1);
  now = 0;
  assert.equal((await runner.run(load, options)).status, 'cutoff');
  assert.equal(releases, 2);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  type SchedulingJob,
  simulateStagedScheduling,
} from '../scripts/experiments/staged-scheduling';

const job = (
  id: string,
  after: string[] = [],
  reservation = 1,
  cost = reservation,
  durationMs = 10,
): SchedulingJob => ({ id, after, reservation, cost, durationMs });

void test('shared preparation releases both politics editors without waiting for social completion', () => {
  const result = simulateStagedScheduling(
    [
      job('pair'),
      job('world', ['pair']),
      job('us', ['pair']),
      job('world-posts', ['world'], 1, 1, 50),
      job('us-posts', ['us']),
    ],
    20,
  );
  const start = (id: string) =>
    result.trace.find((row) => row.id === id && row.event === 'start')!.time;
  assert.equal(start('world'), 10);
  assert.equal(start('us'), 10);
  assert.ok(start('us') < start('world-posts'));
  assert.equal(result.trace.filter((row) => row.id === 'pair').length, 2);
  assert.equal(result.held, 0);
  assert.equal(result.spent, 5);
});

void test('four slots alone cannot protect later story repair admission', () => {
  const jobs = [
    job('nba-initial', [], 4, 1, 20),
    job('pair', [], 1, 1, 10),
    job('us-editor', ['pair'], 6, 1, 30),
    job('nba-repair', ['nba-initial'], 6, 1),
  ];
  const unprotected = simulateStagedScheduling(jobs, 11);
  assert.ok(
    unprotected.trace.some(
      (row) => row.id === 'nba-repair' && row.event === 'refused',
    ),
  );
  // Static protected capacity prevents the early U.S. call, but is not a
  // production solution: ownership/transfer of repair holds is still needed.
  const protectedRun = simulateStagedScheduling(jobs, 11, 2);
  assert.ok(
    protectedRun.trace.some(
      (row) => row.id === 'us-editor' && row.event === 'refused',
    ),
  );
  assert.ok(
    protectedRun.trace.some(
      (row) => row.id === 'nba-repair' && row.event === 'settle',
    ),
  );
  assert.equal(protectedRun.held, 0);
});

void test('settlement releases unused reservations, caps active work and blocks refused descendants', () => {
  const result = simulateStagedScheduling(
    [
      ...Array.from({ length: 5 }, (_, i) => job(`${i}`, [], 2, 0)),
      job('blocked-child', ['expensive']),
      job('expensive', [], 20),
    ],
    8,
  );
  let active = 0;
  let peak = 0;
  for (const row of result.trace) {
    if (row.event === 'start') active++;
    if (row.event === 'settle') active--;
    peak = Math.max(peak, active);
  }
  assert.equal(peak, 4);
  assert.equal(active, 0);
  assert.equal(result.spent, 0);
  assert.equal(result.held, 0);
  assert.ok(result.trace.some((row) => row.event === 'blocked'));
  assert.equal(result.elapsedMs, 20);
});

void test('invalid costs, missing prerequisites and cycles cannot produce scheduling evidence', () => {
  assert.throws(() => simulateStagedScheduling([job('a', ['missing'])], 2));
  assert.throws(() => simulateStagedScheduling([job('a', [], 1, 2)], 2));
  assert.throws(() => simulateStagedScheduling([job('a'), job('a')], 2));
  assert.throws(() => simulateStagedScheduling([job('a', ['a'])], 2));
  assert.throws(() => simulateStagedScheduling([], 2, 3));
});

void test('failure stops queued dispatch but drains and charges already-running calls before returning', () => {
  const result = simulateStagedScheduling(
    [
      { ...job('failed', [], 3, 2, 10), fails: true },
      job('in-flight', [], 4, 3, 30),
      job('same-time', [], 2, 1, 10),
      job('waiting', ['same-time']),
      job('failed-child', ['failed']),
    ],
    12,
  );
  assert.equal(result.failed, true);
  assert.equal(result.elapsedMs, 30);
  assert.equal(result.spent, 6);
  assert.equal(result.held, 0);
  assert.deepEqual(
    result.trace.filter((row) => row.event === 'start').map((row) => row.id),
    ['failed', 'in-flight', 'same-time'],
  );
  assert.deepEqual(
    result.trace
      .filter((row) => row.event === 'cancelled')
      .map((row) => row.id),
    ['waiting', 'failed-child'],
  );
  assert.deepEqual(result.trace.at(-1), {
    id: 'in-flight',
    time: 30,
    event: 'settle',
  });
});

void test('simultaneous failures settle each reservation exactly once', () => {
  const result = simulateStagedScheduling(
    [
      { ...job('a', [], 3, 1), fails: true },
      { ...job('b', [], 4, 2), fails: true },
      job('cancelled', ['a']),
    ],
    7,
  );
  assert.equal(result.spent, 3);
  assert.equal(result.held, 0);
  assert.equal(result.elapsedMs, 10);
  assert.equal(result.trace.filter((row) => row.event === 'failed').length, 2);
  assert.equal(
    result.trace.filter((row) => row.event === 'cancelled').length,
    1,
  );
});

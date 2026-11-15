import assert from 'node:assert/strict';
import { test } from 'node:test';

import { EditorialEnvelopeModel } from '../scripts/experiments/editorial-envelope';
import { simulateStagedScheduling } from '../scripts/experiments/staged-scheduling';

void test('11-unit counterexample protects NBA repair by refusing competing U.S. admission', () => {
  const ledger = new EditorialEnvelopeModel(11);
  assert.equal(ledger.open('nba', 1, 4 + 6), true);
  ledger.transfer('nba', 1, 'initial', 4);
  assert.equal(ledger.open('pair', 1, 1), true);
  ledger.transfer('pair', 1, 'ownership', 1);
  ledger.settle('ownership', 1);
  ledger.close('pair', 1);
  assert.equal(ledger.open('us', 1, 6), false);
  ledger.settle('initial', 1);
  ledger.transfer('nba', 1, 'repair', 6);
  assert.deepEqual(ledger.snapshot(), {
    spent: 2,
    held: 6,
    owned: 0,
    total: 8,
    peak: 11,
  });
  ledger.settle('repair', 1);
  ledger.close('nba', 1);
  assert.equal(ledger.snapshot().total, 3);
});

void test('initial dispatch is refused if initial and bounded repair cannot both fit', () => {
  const ledger = new EditorialEnvelopeModel(9);
  assert.equal(ledger.open('nba', 1, 10), false);
  assert.throws(() => ledger.transfer('nba', 1, 'initial', 4));
  assert.equal(ledger.snapshot().total, 0);
});

void test('successful validation or cache hit releases unused balance for other topics', () => {
  for (const cacheHit of [false, true]) {
    const ledger = new EditorialEnvelopeModel(11);
    ledger.open('nba', 1, 10);
    if (!cacheHit) {
      ledger.transfer('nba', 1, 'initial', 4);
      ledger.settle('initial', 1);
    }
    ledger.close('nba', 1);
    ledger.close('nba', 1);
    assert.equal(ledger.open('us', 1, 6), true);
    assert.equal(ledger.snapshot().total, cacheHit ? 6 : 7);
  }
});

void test('atomic transfer has no double hold and rejects repair growth or conflicting duplicates', () => {
  const ledger = new EditorialEnvelopeModel(10);
  ledger.open('nba', 1, 10);
  ledger.transfer('nba', 1, 'initial', 4);
  ledger.transfer('nba', 1, 'initial', 4);
  assert.equal(ledger.snapshot().total, 10);
  assert.equal(ledger.snapshot().owned, 6);
  assert.throws(() => ledger.transfer('nba', 1, 'initial', 3));
  assert.throws(() => ledger.transfer('nba', 1, 'repair', 7));
  ledger.settle('initial', 1);
  ledger.settle('initial', 1);
  assert.throws(() => ledger.settle('initial', 2));
  assert.equal(ledger.snapshot().total, 7);
});

void test('fenced recovery releases only owned balance and preserves uncertain in-flight charges', () => {
  const ledger = new EditorialEnvelopeModel(10);
  ledger.open('nba', 1, 10);
  ledger.transfer('nba', 1, 'uncertain', 4);
  assert.throws(() => ledger.recover('nba', 1, 2));
  ledger.fence('nba', 1);
  assert.throws(() => ledger.transfer('nba', 1, 'repair', 6));
  ledger.recover('nba', 1, 2);
  assert.throws(() => ledger.close('nba', 1));
  assert.equal(ledger.snapshot().held, 4);
  assert.equal(ledger.snapshot().owned, 0);
  assert.equal(ledger.open('us', 1, 7), false);
  // Drain the old call after fencing; its identity still settles exactly once.
  ledger.settle('uncertain', 4);
  ledger.settle('uncertain', 4);
  assert.equal(ledger.snapshot().spent, 4);
});

void test('definite nondispatch releases its hold; malformed scenarios cannot enter accounting', () => {
  const ledger = new EditorialEnvelopeModel(10);
  ledger.open('nba', 1, 10);
  ledger.transfer('nba', 1, 'not-sent', 4);
  ledger.settle('not-sent', 0);
  ledger.close('nba', 1);
  assert.equal(ledger.snapshot().total, 0);
  assert.throws(() => ledger.open('', 1, 1));
  assert.throws(() => ledger.open('x', 0, 1));
  assert.throws(() => ledger.open('x', 1, -1));
  assert.throws(() => ledger.settle('missing', 0));
});

void test('whole-topic serialization admits U.S. later while early owned admission refuses it', () => {
  const call = (
    id: string,
    after: string[],
    reservation: number,
    durationMs: number,
  ) => ({ id, after, reservation, cost: 1, durationMs });
  const wholeTopic = simulateStagedScheduling(
    [
      call('nba-initial', [], 4, 20),
      call('pair', [], 1, 10),
      call('nba-repair', ['nba-initial'], 6, 10),
      call('us-editor', ['pair', 'nba-repair'], 6, 30),
    ],
    11,
  );
  assert.ok(
    wholeTopic.trace.some(
      (row) => row.id === 'us-editor' && row.event === 'settle',
    ),
  );
  assert.equal(wholeTopic.elapsedMs, 60);
  assert.equal(wholeTopic.spent, 4);
  // The owned model above protects NBA but refuses early U.S. admission.
  // Neither a speedup nor unchanged topic acceptance follows from protection.
});

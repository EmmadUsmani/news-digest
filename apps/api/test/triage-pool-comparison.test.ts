import assert from 'node:assert/strict';
import { test } from 'node:test';

import { comparePools } from '../../../scripts/compare-triage-pools';

function capture(hour: number, rows: [string, boolean][]) {
  return {
    capturedAt: `2026-11-04T0${hour}:00:00.000Z`,
    windowStart: '2026-11-03T15:00:00.000Z',
    windowEnd: '2026-11-04T15:00:00.000Z',
    pools: [
      {
        topic: { id: 'tech', name: 'Tech', story_budget: 5 },
        candidates: rows.map(([id, triageEligible]) => ({
          id,
          triageEligible,
        })),
      },
    ],
  };
}

void test('pool comparison distinguishes retained, new, absent and newly ineligible membership', () => {
  const result = comparePools(
    capture(1, [
      ['a', true],
      ['b', true],
      ['c', true],
      ['d', false],
    ]),
    capture(2, [
      ['a', true],
      ['b', false],
      ['d', true],
      ['e', true],
    ]),
  );
  assert.deepEqual(result.topics[0], {
    topicId: 'tech',
    topic: 'Tech',
    topicAdded: false,
    topicRemoved: false,
    beforeEligible: 3,
    afterEligible: 3,
    retainedEligible: 1,
    addedEligible: 2,
    lostEligible: 2,
    lostAbsent: 1,
    lostIneligible: 1,
    settingsChanged: false,
  });
});

void test('pool comparison rejects mismatched, reversed, duplicate and malformed evidence', () => {
  const first = capture(1, [['a', true]]);
  const second = capture(2, [['a', true]]);
  assert.throws(() => comparePools(second, first), /chronological/);
  assert.throws(() => comparePools(first, first), /chronological/);
  assert.throws(
    () =>
      comparePools(first, { ...second, windowEnd: '2026-11-05T15:00:00.000Z' }),
    /same valid window/,
  );
  assert.throws(
    () =>
      comparePools(
        first,
        capture(2, [
          ['a', true],
          ['a', false],
        ]),
      ),
    /Duplicate candidate/,
  );
  assert.throws(
    () =>
      comparePools(first, {
        ...second,
        pools: [...second.pools, ...second.pools],
      }),
    /Duplicate topic/,
  );
  assert.throws(() => comparePools({}, second));
});

void test('pool comparison accounts for removed topics and reports settings changes', () => {
  const first = capture(1, [['a', true]]);
  const second = capture(2, [['a', true]]);
  second.pools[0].topic.story_budget = 0;
  assert.equal(comparePools(first, second).topics[0].settingsChanged, true);
  const removed = comparePools(first, { ...second, pools: [] }).topics[0];
  assert.equal(removed.topicRemoved, true);
  assert.equal(removed.lostAbsent, 1);
  assert.equal(
    comparePools({ ...first, pools: [] }, second).topics[0].topicAdded,
    true,
  );
});

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  type EventBudgetSlot,
  planJointEventBudget,
} from '../src/modules/social/domain/joint-event-budget';

const slot = (
  id: string,
  event: string,
  materialFacts: string[] = [],
): EventBudgetSlot => ({ id, event, materialFacts });

void test('replaces a repeating post with a qualified different event', () => {
  assert.deepEqual(
    planJointEventBudget({
      stories: [slot('story', 'launch')],
      candidates: [slot('repeat', 'launch'), slot('new', 'outage')],
      selectedPostIds: ['repeat'],
      postBudget: 1,
    }),
    ['new'],
  );
});

void test('preserves material facts even when losing them would reduce concentration', () => {
  assert.deepEqual(
    planJointEventBudget({
      stories: [slot('story', 'launch')],
      candidates: [
        slot('detail', 'launch', ['access']),
        slot('new', 'outage', ['access']),
      ],
      selectedPostIds: ['detail'],
      postBudget: 1,
    }),
    ['detail'],
  );
});

void test('a replacement can carry all original facts and free a slot for another event', () => {
  assert.deepEqual(
    planJointEventBudget({
      stories: [slot('story', 'launch')],
      candidates: [
        slot('a', 'launch', ['price']),
        slot('b', 'launch', ['access']),
        slot('complete', 'launch', ['price', 'access']),
        slot('new', 'outage'),
      ],
      selectedPostIds: ['a', 'b'],
      postBudget: 2,
    }),
    ['complete', 'new'],
  );
});

void test('never loses an event or changes original order for an equal share', () => {
  assert.deepEqual(
    planJointEventBudget({
      stories: [slot('story', 'launch')],
      candidates: [
        slot('a', 'outage'),
        slot('b', 'contract'),
        slot('c', 'trade'),
      ],
      selectedPostIds: ['b', 'a'],
      postBudget: 2,
    }),
    ['b', 'a'],
  );
});

void test('handles empty topics without padding or undefined fractions', () => {
  assert.deepEqual(
    planJointEventBudget({
      stories: [],
      candidates: [slot('a', 'outage')],
      selectedPostIds: [],
      postBudget: 1,
    }),
    [],
  );
});

void test('rejects missing annotations, unknown baseline IDs and unbounded searches', () => {
  const input = {
    stories: [],
    candidates: [slot('a', 'outage')],
    selectedPostIds: ['a'],
    postBudget: 1,
  };
  for (const invalid of [
    { ...input, candidates: [slot('a', '')] },
    { ...input, selectedPostIds: ['unknown'] },
    { ...input, selectedPostIds: ['a', 'a'], postBudget: 2 },
    { ...input, postBudget: 0 },
    { ...input, postBudget: 1.5 },
    { ...input, stories: [slot('a', 'other')] },
    {
      ...input,
      candidates: Array.from({ length: 11 }, (_, i) =>
        slot(String(i), 'event'),
      ),
      selectedPostIds: ['0'],
    },
  ])
    assert.throws(() => planJointEventBudget(invalid), /bounded/);
});

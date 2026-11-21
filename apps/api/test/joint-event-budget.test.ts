import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  type EventBudgetSlot,
  planJointEventBudget,
} from '../src/modules/social/domain/joint-event-budget';
import { selectWithEventBudget } from '../src/modules/social/public/event-budget';

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

void test('evidence-bound selection returns complete original candidate metadata', () => {
  const story = { id: 'story', text: 'Launch available today' };
  const repeat = {
    id: 'repeat',
    text: 'Launch available today',
    rationale: 'repeat',
  };
  const different = {
    id: 'new',
    text: 'Outage restored',
    rationale: 'reporting',
    url: 'https://example.com/post',
  };
  const result = selectWithEventBudget({
    stories: [story],
    candidates: [repeat, different],
    selectedPostIds: ['repeat'],
    postBudget: 1,
    annotations: [
      {
        id: 'story',
        event: 'launch',
        eventEvidence: 'Launch',
        materialFacts: [{ id: 'access', evidence: 'available today' }],
      },
      {
        id: 'repeat',
        event: 'launch',
        eventEvidence: 'Launch',
        materialFacts: [{ id: 'access', evidence: 'available today' }],
      },
      {
        id: 'new',
        event: 'outage',
        eventEvidence: 'Outage',
        materialFacts: [{ id: 'restored', evidence: 'restored' }],
      },
    ],
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.posts[0], different);
});

void test('incomplete, stale or invented annotations preserve baseline objects and order', () => {
  const candidates = [
    { id: 'a', text: 'Launch' },
    { id: 'b', text: 'Outage' },
  ];
  const annotations = candidates.map((post) => ({
    id: post.id,
    event: post.id,
    eventEvidence: post.text,
    materialFacts: [] as { id: string; evidence: string }[],
  }));
  for (const invalid of [
    annotations.slice(0, 1),
    [...annotations, annotations[0]],
    [annotations[0], { ...annotations[1], id: 'unknown' }],
    [annotations[0], { ...annotations[1], eventEvidence: 'Resolved outage' }],
    [
      annotations[0],
      { ...annotations[1], materialFacts: [{ id: 'price', evidence: '$20' }] },
    ],
    [annotations[0], { ...annotations[1], eventEvidence: ' ' }],
  ]) {
    const result = selectWithEventBudget({
      stories: [],
      candidates,
      selectedPostIds: ['b', 'a'],
      postBudget: 2,
      annotations: invalid,
    });
    assert.equal(result.status, 'invalid-annotations');
    assert.equal(result.posts[0], candidates[1]);
    assert.equal(result.posts[1], candidates[0]);
  }
  assert.throws(
    () =>
      selectWithEventBudget({
        stories: [],
        candidates,
        selectedPostIds: ['missing'],
        postBudget: 1,
        annotations: [],
      }),
    /unique selected/,
  );
  assert.throws(
    () =>
      selectWithEventBudget({
        stories: [],
        candidates,
        selectedPostIds: ['a'],
        postBudget: 0,
        annotations: [],
      }),
    /bounded/,
  );
});

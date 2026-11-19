import assert from 'node:assert/strict';
import { test } from 'node:test';

import { developingCapturedPlan } from '../../../scripts/lib/developing-captured-plan';

const request = {
  model: { id: 'editor', input: 1, output: 1, cacheRead: 0, cacheWrite: 1 },
  runId: 'offline',
  purpose: 'capture',
  instructions: '',
  prompt: '',
  maxOutputTokens: 1,
};
const capture = (topicId: string) => ({
  editionId: 'edition',
  topicId,
  status: 'request-ready',
  request: { ...request, topicId },
});
const plan = {
  editionId: 'edition',
  topicIds: ['a', 'b'],
  matching: [capture('a'), capture('b')],
  rewrites: [capture('a'), capture('b')],
  additionalRequests: [request],
  budget: {
    now: new Date('2026-11-30T00:00:00Z'),
    totals: { month: 0, today: 0 },
    caps: { monthly: 20000, dailyMax: 20000 },
    modelToday: {},
    protectedMicros: 1000,
    protectedModelMicros: {},
  },
};

void test('complete topic captures include repairs and protected edition work', () => {
  const result = developingCapturedPlan(plan);
  assert.equal(result.status, 'fits-supplied-plan');
  assert.equal(result.topicCount, 2);
  assert.equal(result.requestCount, 5);
  assert.equal(result.featureMicros, 10245);
  assert.equal(result.requiredMicros, 11245);
  assert.equal(
    developingCapturedPlan({
      ...plan,
      budget: { ...plan.budget, protectedMicros: 10000 },
    }).status,
    'shared-budget-refused',
  );
});

void test('partial, duplicate, cross-edition and unavailable captures refuse atomically', () => {
  for (const field of ['matching', 'rewrites'] as const) {
    for (const captures of [
      [],
      [capture('a')],
      [capture('a'), capture('a')],
      [capture('a'), capture('c')],
      [capture('a'), { ...capture('b'), editionId: 'other' }],
      [capture('a'), { ...capture('b'), status: 'unavailable', request: null }],
      [
        capture('a'),
        { ...capture('b'), request: { ...request, topicId: 'a' } },
      ],
    ])
      assert.throws(() =>
        developingCapturedPlan({ ...plan, [field]: captures }),
      );
  }
  for (const topicIds of [[], ['a', 'a'], ['']])
    assert.throws(() => developingCapturedPlan({ ...plan, topicIds }));
});

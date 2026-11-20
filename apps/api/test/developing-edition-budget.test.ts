import assert from 'node:assert/strict';
import { test } from 'node:test';

import { developingEditionBudget } from '../../../scripts/lib/developing-edition-budget';

const request = {
  model: { id: 'editor', input: 1, cacheRead: 0, cacheWrite: 2, output: 3 },
  runId: 'offline',
  purpose: 'developing-rewrite',
  instructions: '',
  prompt: '日',
  maxOutputTokens: 100,
};
const plan = {
  now: new Date('2026-11-30T12:00:00Z'),
  totals: { month: 0, today: 0 },
  caps: {
    monthly: 20000,
    dailyMax: 20000,
    modelAllocation: { model: 'editor', dailyFraction: 0.5 },
  },
  modelToday: { editor: 0 },
  protectedMicros: 1000,
  protectedModelMicros: { editor: 1000 },
  requests: [request, { ...request, purpose: 'matching' }],
};

void test('combined requests preserve edition funds and use conservative Unicode/cache prices', () => {
  const result = developingEditionBudget(plan);
  assert.equal(result.featureMicros, 8804);
  assert.equal(result.requiredMicros, 9804);
  assert.equal(result.status, 'fits-supplied-plan');
  assert.equal(
    developingEditionBudget({ ...plan, protectedMicros: 12000 }).status,
    'shared-budget-refused',
  );
  assert.equal(
    developingEditionBudget({
      ...plan,
      totals: { month: 197, today: 197 },
      modelToday: { editor: 197 },
    }).status,
    'model-budget-refused',
  );
  assert.equal(
    developingEditionBudget({
      ...plan,
      totals: { month: 196, today: 196 },
      modelToday: { editor: 196 },
    }).status,
    'fits-supplied-plan',
  );
});

void test('monthly headroom, outstanding holds, oversized input and invalid funds fail closed', () => {
  assert.equal(
    developingEditionBudget({ ...plan, totals: { month: 15000, today: 0 } })
      .status,
    'shared-budget-refused',
  );
  assert.equal(
    developingEditionBudget({ ...plan, totals: { month: 11000, today: 11000 } })
      .status,
    'shared-budget-refused',
  );
  assert.equal(
    developingEditionBudget({
      ...plan,
      requests: [{ ...request, prompt: 'a'.repeat(97952) }],
    }).status,
    'input-limit',
  );
  assert.throws(() =>
    developingEditionBudget({ ...plan, protectedMicros: 999 }),
  );
  assert.throws(() => developingEditionBudget({ ...plan, modelToday: {} }));
  assert.throws(() =>
    developingEditionBudget({ ...plan, protectedModelMicros: {} }),
  );
  for (const output of [0, 16001, 1.5])
    assert.throws(() =>
      developingEditionBudget({
        ...plan,
        requests: [{ ...request, maxOutputTokens: output }],
      }),
    );
  for (const invalid of [-1, NaN, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() =>
      developingEditionBudget({ ...plan, protectedMicros: invalid }),
    );
  assert.throws(() =>
    developingEditionBudget({ ...plan, protectedModelMicros: { editor: -1 } }),
  );
});

void test('preflight rejects invalid original prices before selecting the conservative rate', () => {
  for (const rate of ['input', 'output', 'cacheRead', 'cacheWrite'] as const) {
    for (const invalid of [-1, NaN, Infinity, -Infinity]) {
      assert.throws(
        () =>
          developingEditionBudget({
            ...plan,
            requests: [
              { ...request, model: { ...request.model, [rate]: invalid } },
            ],
          }),
        /Invalid token usage or pricing/,
        `${rate}=${invalid}`,
      );
    }
  }
  const free = developingEditionBudget({
    ...plan,
    requests: [
      {
        ...request,
        model: {
          ...request.model,
          input: 0,
          output: 0,
          cacheRead: 0,
          cacheWrite: 0,
        },
      },
    ],
  });
  assert.equal(free.featureMicros, 0);
  assert.equal(free.requiredMicros, plan.protectedMicros);
});

void test('preflight refuses contradictory shared and per-model spend snapshots', () => {
  for (const snapshot of [
    { totals: { month: 100, today: 101 }, modelToday: { editor: 0 } },
    { totals: { month: 100, today: 100 }, modelToday: { editor: 101 } },
    {
      totals: { month: 100, today: 100 },
      modelToday: { editor: 60, triage: 41 },
    },
  ]) {
    assert.throws(
      () => developingEditionBudget({ ...plan, ...snapshot }),
      /Inconsistent edition budget snapshot/,
    );
  }
  // Other models and unlisted historical models can account for shared spend.
  for (const modelToday of [
    { editor: 60, triage: 40 },
    { editor: 60, triage: 20 },
  ]) {
    assert.equal(
      developingEditionBudget({
        ...plan,
        totals: { month: 200, today: 100 },
        modelToday,
      }).status,
      'fits-supplied-plan',
    );
  }
});

void test('one edition refuses conflicting rates for one model but permits distinct models', () => {
  for (const rate of ['input', 'output', 'cacheRead', 'cacheWrite'] as const) {
    const changed = { ...request, model: { ...request.model, [rate]: 10 } };
    for (const requests of [
      [request, changed],
      [changed, request],
    ]) {
      assert.throws(
        () => developingEditionBudget({ ...plan, requests }),
        /Conflicting edition model prices/,
      );
    }
    assert.equal(
      developingEditionBudget({
        ...plan,
        caps: { monthly: 1000000, dailyMax: 1000000 },
        requests: [
          request,
          { ...changed, model: { ...changed.model, id: 'other' } },
        ],
      }).status,
      'fits-supplied-plan',
    );
  }
});

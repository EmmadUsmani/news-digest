import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { checkDevelopingCapturedPlan } from '../../../scripts/check-developing-captured-plan';
import {
  developingCapturedPlan,
  developingContextCapturedPlan,
  developingInventoryCapturedPlan,
  developingProtectedCapturedPlan,
} from '../../../scripts/lib/developing-captured-plan';

const request = {
  model: { id: 'editor', input: 1, output: 1, cacheRead: 0, cacheWrite: 1 },
  runId: 'edition',
  purpose: 'capture',
  instructions: '',
  prompt: '',
  maxOutputTokens: 1,
};
const capture = (topicId: string, purpose = 'story-grouping-v3') => ({
  editionId: 'edition',
  topicId,
  status: 'request-ready',
  request: { ...request, topicId, purpose },
});
const plan = {
  editionId: 'edition',
  topicIds: ['a', 'b'],
  matching: [capture('a'), capture('b')],
  rewrites: [
    capture('a', 'developing-rewrite'),
    capture('b', 'developing-rewrite'),
  ],
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

void test('stage substitutions and missing topic attribution cannot establish admission', () => {
  const before = structuredClone(plan);
  for (const field of ['matching', 'rewrites'] as const) {
    const other = field === 'matching' ? 'rewrites' : 'matching';
    assert.throws(
      () => developingCapturedPlan({ ...plan, [field]: plan[other] }),
      /purpose differs/,
    );
    for (const purpose of ['capture', 'story-editor', ''])
      assert.throws(
        () =>
          developingCapturedPlan({
            ...plan,
            [field]: plan[field].map((item) => ({
              ...item,
              request: { ...item.request, purpose },
            })),
          }),
        /purpose differs/,
      );
    assert.throws(
      () =>
        developingCapturedPlan({
          ...plan,
          [field]: plan[field].map((item) => ({
            ...item,
            request: { ...item.request, topicId: undefined },
          })),
        }),
      /topic differs/,
    );
  }
  assert.deepEqual(plan, before);
});

void test('file preflight emits no report on stage substitution and retains existing evidence', () => {
  const directory = mkdtempSync(join(tmpdir(), 'developing-plan-'));
  const input = join(directory, 'input.json');
  const output = join(directory, 'report.json');
  try {
    writeFileSync(input, JSON.stringify({ ...plan, rewrites: plan.matching }));
    const original = readFileSync(input, 'utf8');
    assert.throws(
      () => checkDevelopingCapturedPlan(input, output),
      /purpose differs/,
    );
    assert.equal(existsSync(output), false);
    assert.equal(readFileSync(input, 'utf8'), original);
    writeFileSync(output, 'existing evidence');
    assert.throws(
      () => checkDevelopingCapturedPlan(input, output),
      /purpose differs/,
    );
    assert.equal(readFileSync(output, 'utf8'), 'existing evidence');
    writeFileSync(input, JSON.stringify(plan));
    rmSync(output);
    assert.equal(
      checkDevelopingCapturedPlan(input, output).status,
      'fits-supplied-plan',
    );
    assert.throws(() => checkDevelopingCapturedPlan(input, output), /EEXIST/);
    rmSync(output);
    writeFileSync(
      input,
      JSON.stringify({ ...plan, protectedRequests: [request] }),
    );
    const derived = checkDevelopingCapturedPlan(input, output);
    assert.equal(derived.requiredMicros, 12294);
    assert.equal(derived.status, 'fits-supplied-plan');
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

void test('foreign or missing execution attribution refuses both stages and additional work', () => {
  for (const runId of ['', ' ', 'offline-request-capture', 'other-edition']) {
    for (const field of ['matching', 'rewrites'] as const) {
      assert.throws(
        () =>
          developingCapturedPlan({
            ...plan,
            [field]: plan[field].map((item) => ({
              ...item,
              request: { ...item.request, runId },
            })),
          }),
        /run differs/,
      );
    }
    assert.throws(
      () =>
        developingCapturedPlan({
          ...plan,
          additionalRequests: [{ ...request, runId }],
        }),
      /run differs/,
    );
  }
  assert.throws(
    () => developingCapturedPlan({ ...plan, editionId: ' ' }),
    /Invalid expected/,
  );
  assert.throws(
    () => developingCapturedPlan({ ...plan, topicIds: [' '] }),
    /Invalid expected/,
  );
});

void test('request-derived morning protection accounts for shared and allocated-model costs', () => {
  const budget = {
    now: plan.budget.now,
    totals: plan.budget.totals,
    caps: {
      ...plan.budget.caps,
      modelAllocation: { model: 'editor', dailyFraction: 0.6 },
    },
    modelToday: { editor: 0 },
  };
  const input = { ...plan, budget, protectedRequests: [request] };
  const result = developingProtectedCapturedPlan(input);
  assert.equal(result.protectedMicros, 2049);
  assert.deepEqual(result.protectedModelMicros, { editor: 2049 });
  assert.equal(result.requiredMicros, 12294);
  assert.equal(result.status, 'model-budget-refused');
  assert.equal(
    developingProtectedCapturedPlan({ ...input, protectedRequests: [] }).status,
    'fits-supplied-plan',
  );
  assert.equal(
    developingProtectedCapturedPlan({
      ...input,
      protectedRequests: [request, request, request, request, request],
    }).status,
    'shared-budget-refused',
  );
  assert.throws(
    () =>
      developingProtectedCapturedPlan({
        ...input,
        protectedRequests: [{ ...request, runId: 'other' }],
      }),
    /edition differs/,
  );
  assert.equal(
    developingProtectedCapturedPlan({
      ...input,
      protectedRequests: [{ ...request, prompt: 'x'.repeat(100000) }],
    }).status,
    'input-limit',
  );
});

void test('inventory preflight derives protected costs only after complete context validation', () => {
  const slot = {
    stage: 'story' as const,
    topicIds: ['a'],
    contextId: 'editor',
  };
  const empty = {
    stage: 'social' as const,
    topicIds: ['b'],
    contextId: 'bluesky',
  };
  const protectedRequest = {
    ...request,
    topicId: 'a',
    purpose: 'shortlist-editor-v14-brief',
  };
  const input = {
    ...plan,
    protectedInventory: {
      expected: [slot, empty],
      supplied: [
        { slot, requests: [protectedRequest] },
        { slot: empty, requests: [] },
      ],
    },
  };
  const before = structuredClone(input);
  const result = developingInventoryCapturedPlan(input);
  const flat = developingProtectedCapturedPlan({
    ...plan,
    protectedRequests: [protectedRequest],
  });
  assert.deepEqual(result, { ...flat, protectedSlotCount: 2 });
  assert.equal(result.protectedMicros, 2049);
  assert.equal(
    developingInventoryCapturedPlan({
      ...input,
      budget: { ...input.budget, caps: { monthly: 11000, dailyMax: 11000 } },
    }).status,
    'shared-budget-refused',
  );
  assert.throws(
    () =>
      developingInventoryCapturedPlan({
        ...input,
        protectedInventory: {
          ...input.protectedInventory,
          supplied: input.protectedInventory.supplied.slice(0, 1),
        },
      }),
    /Missing/,
  );
  assert.throws(
    () =>
      developingInventoryCapturedPlan({
        ...input,
        protectedRequests: [],
      } as Parameters<typeof developingInventoryCapturedPlan>[0]),
    /Ambiguous/,
  );
  assert.deepEqual(input, before);
});

void test('file inventory refusal preserves existing evidence and never falls back to flat requests', () => {
  const directory = mkdtempSync(join(tmpdir(), 'developing-inventory-'));
  const input = join(directory, 'input.json');
  const output = join(directory, 'report.json');
  const slot = { stage: 'social', topicIds: ['a'], contextId: 'x' };
  const data = {
    ...plan,
    protectedInventory: {
      expected: [slot],
      supplied: [{ slot, requests: [] }],
    },
  };
  try {
    writeFileSync(input, JSON.stringify(data));
    const result = checkDevelopingCapturedPlan(input, output);
    assert.equal(result.status, 'fits-supplied-plan');
    assert.equal(
      'protectedSlotCount' in result && result.protectedSlotCount,
      1,
    );
    const original = readFileSync(output, 'utf8');
    for (const invalid of [
      { ...data, protectedInventory: { expected: [slot], supplied: [] } },
      { ...data, protectedRequests: [] },
    ]) {
      writeFileSync(input, JSON.stringify(invalid));
      assert.throws(
        () => checkDevelopingCapturedPlan(input, output),
        /Missing|Ambiguous/,
      );
      assert.equal(readFileSync(output, 'utf8'), original);
      rmSync(output);
      assert.throws(
        () => checkDevelopingCapturedPlan(input, output),
        /Missing|Ambiguous/,
      );
      assert.equal(existsSync(output), false);
      writeFileSync(output, original);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

void test('context-derived protected bounds feed the captured feature budget gate', async () => {
  const context: Parameters<
    typeof developingContextCapturedPlan
  >[0]['protectedContexts'] = {
    expected: [
      { stage: 'article-triage', topicIds: ['a'], contextId: 'articles' },
    ],
    contexts: [
      {
        stage: 'triage',
        contextId: 'articles',
        input: {
          model: request.model,
          kind: 'article',
          args: [
            { id: 'a', name: 'Tech', description: '', guidance: '' },
            [{ id: 'item', title: 'Launch', sources: ['Publisher'] }],
            'edition',
          ],
        },
      },
    ],
  };
  const {
    protectedMicros: _shared,
    protectedModelMicros: _models,
    ...budget
  } = plan.budget;
  const input = { ...plan, budget, protectedContexts: context };
  const before = structuredClone(input);
  const result = await developingContextCapturedPlan(input);
  assert.equal(result.protectedSlotCount, 1);
  assert.equal(result.protectedRequestCount, 2);
  assert.ok(result.protectedMicros > 0);
  assert.equal(result.status, 'shared-budget-refused');
  assert.deepEqual(input, before);
  await assert.rejects(
    developingContextCapturedPlan({
      ...input,
      protectedContexts: { ...context, contexts: [] },
    }),
    /Missing/,
  );
  await assert.rejects(
    developingContextCapturedPlan({ ...input, ...{ protectedRequests: [] } }),
    /Ambiguous/,
  );
  await assert.rejects(
    developingContextCapturedPlan({ ...input, ...{ protectedInventory: {} } }),
    /Ambiguous/,
  );
});

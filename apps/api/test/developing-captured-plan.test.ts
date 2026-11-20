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
import { developingCapturedPlan } from '../../../scripts/lib/developing-captured-plan';

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

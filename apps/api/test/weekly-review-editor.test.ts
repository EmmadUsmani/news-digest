import assert from 'node:assert/strict';
import { test } from 'node:test';

import { llmConfig } from '../src/modules/curation/adapters/config';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';
import type { LlmLedger } from '../src/modules/curation/domain/llm-ledger.port';
import {
  validateWeeklyReview,
  weeklyEditorEvidence,
  WeeklyReviewEditor,
} from '../src/modules/digests/application/weekly-review-editor';
import type { weeklyReviewInput } from '../src/modules/digests/domain/weekly-review-input';

type Input = ReturnType<typeof weeklyReviewInput>;
const story = {
  id: 'recurring-id',
  title: 'Daily headline',
  url: 'https://example.com/story',
  summary: 'Saved summary',
  excerpt: 'Saved excerpt',
  sources: ['Publisher'],
  publishedAt: '2026-11-21T15:00:00Z',
  score: 9,
  reasons: ['Private score'],
};
const input: Input = {
  windowStart: '2026-11-15T17:00:00Z',
  windowEnd: '2026-11-22T17:00:00Z',
  editions: [21, 22].map((day) => ({
    editionId: `daily-${day}`,
    publishedAt: `2026-11-${day}T15:00:00Z`,
    windowEnd: `2026-11-${day}T15:00:00Z`,
    stories: [structuredClone(story)],
    posts: [
      {
        platform: 'x',
        externalId: 'post',
        author: 'Reporter',
        authorUrl: 'https://x.com/reporter',
        url: 'https://x.com/reporter/status/1',
        text: 'Saved post',
        publishedAt: story.publishedAt,
        metrics: {},
        reasons: [],
      },
    ],
  })),
};
const pick = (references = ['d0:s0', 'd1:s0', 'd1:p0']) => ({
  title: 'The week’s development',
  summary: 'The story moved from A to B.',
  references,
});

void test('weekly editor preserves cross-day provenance and excludes private ranking metadata', () => {
  const before = structuredClone(input);
  const evidence = weeklyEditorEvidence(input);
  assert.equal(evidence.length, 4);
  assert.equal('score' in evidence[0], false);
  assert.equal('reasons' in evidence[0], false);
  const result = validateWeeklyReview(input, { stories: [pick()] });
  assert.ok(result);
  assert.deepEqual(
    result.stories[0].coverage.map((x) => x.editionId),
    ['daily-21', 'daily-22', 'daily-22'],
  );
  result.stories[0].coverage[0].text = 'Changed';
  assert.deepEqual(input, before);
});

void test('weekly editor rejects invented, duplicate, reused and post-only coverage atomically', () => {
  for (const stories of [
    [pick(['unknown'])],
    [pick(['d0:s0', 'd0:s0'])],
    [pick(['d0:s0']), pick(['d0:s0'])],
    [pick(['d0:p0'])],
    [pick(['d0:s0']), pick(['invented'])],
  ])
    assert.equal(validateWeeklyReview(input, { stories }), null);
});

void test('weekly editor enforces five stories, nonblank prose and strict output shape', () => {
  for (const response of [
    { stories: Array.from({ length: 6 }, () => pick()) },
    { stories: [{ ...pick(), title: ' ' }] },
    { stories: [{ ...pick(), summary: '' }] },
    { stories: [{ ...pick(), url: 'https://invented.com' }] },
    { stories: [pick()], extra: true },
  ])
    assert.equal(validateWeeklyReview(input, response), null);
  assert.deepEqual(validateWeeklyReview(input, { stories: [] })?.stories, []);
});

void test('weekly execution reserves and settles once, reuses cache and preserves daily snapshots', async () => {
  const before = structuredClone(input);
  const harness = weeklyHarness({ stories: [pick()] });
  const editor = new WeeklyReviewEditor(harness.llm, llmConfig({}).sonnet);
  const first = await editor.edit({ id: 'tech', name: 'Tech' }, input, 'run-1');
  const second = await editor.edit(
    { id: 'tech', name: 'Tech' },
    input,
    'run-2',
  );
  assert.ok(first);
  assert.deepEqual(first, second);
  assert.equal(harness.requests.length, 1);
  assert.equal(harness.reservations, 1);
  assert.equal(harness.settlements, 1);
  assert.equal(harness.requests[0].purpose, 'weekly-review-editor-v1');
  assert.equal(harness.requests[0].topicId, 'tech');
  assert.equal(harness.requests[0].model.id, llmConfig({}).sonnet.id);
  assert.equal(harness.requests[0].prompt.includes('Private score'), false);
  assert.deepEqual(input, before);
});

void test('weekly refusal and invalid coverage produce no fallback or repair calls', async () => {
  for (const blocked of [false, true]) {
    const harness = weeklyHarness({ stories: [pick(['invented'])] }, blocked);
    const editor = new WeeklyReviewEditor(harness.llm, llmConfig({}).sonnet);
    assert.equal(
      await editor.edit({ id: 'tech', name: 'Tech' }, input, 'run'),
      null,
    );
    assert.equal(harness.requests.length, blocked ? 0 : 1);
    assert.equal(harness.settlements, blocked ? 0 : 1);
    assert.equal(harness.values.size, 0);
  }
  const harness = weeklyHarness({ stories: [] });
  const editor = new WeeklyReviewEditor(harness.llm, llmConfig({}).sonnet);
  assert.equal(
    await editor.edit(
      { id: 'tech', name: 'Tech' },
      { ...input, editions: [] },
      'empty',
    ),
    null,
  );
  assert.equal(harness.reservations, 0);
});

function weeklyHarness(response: unknown, blocked = false) {
  const state = {
    reservations: 0,
    settlements: 0,
    requests: [] as LlmRequest[],
    values: new Map<string, unknown>(),
  };
  const ledger: LlmLedger = {
    reserve: async () => {
      state.reservations++;
      return blocked ? null : 'hold';
    },
    settle: async () => {
      state.settlements++;
    },
    fail: async () => {},
    cached: async (key) => state.values.get(key),
    cache: async (key, value) => {
      state.values.set(key, value);
    },
  };
  const llm = new BudgetedLlm(
    {
      complete: async (request) => {
        state.requests.push(request);
        return {
          text: JSON.stringify(response),
          usage: { input: 100, output: 100, cacheWrite: 0, cacheRead: 0 },
        };
      },
    },
    ledger,
  );
  return Object.assign(state, { llm });
}

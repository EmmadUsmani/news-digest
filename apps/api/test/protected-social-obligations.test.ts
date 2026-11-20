import assert from 'node:assert/strict';
import { test } from 'node:test';

import { developingEditionBudget } from '../../../scripts/lib/developing-edition-budget';
import { protectedSocialObligations } from '../../../scripts/lib/protected-social-obligations';
import { BudgetedLlm } from '../src/modules/curation/application/budgeted-llm';
import { SocialPostEditor } from '../src/modules/curation/application/social-editor';
import {
  LlmValidationFailure,
  maximumValidationRepairFeedback,
  schemaRepairFeedback,
} from '../src/modules/curation/application/validation-failure';
import type { LlmRequest } from '../src/modules/curation/domain/llm.port';

const sonnet = {
  id: 'sonnet',
  input: 3,
  output: 15,
  cacheRead: 0.3,
  cacheWrite: 3.75,
};
const haiku = {
  id: 'haiku',
  input: 1,
  output: 5,
  cacheRead: 0.1,
  cacheWrite: 1.25,
};
const topic = { id: 'gaming', name: 'Gaming', description: '', guidance: '' };
const candidate = {
  id: 'post',
  text: 'The studio announced a new game.',
  author: 'Studio',
  publishedAt: '2026-11-18T12:00:00Z',
  relevance: 9,
  interestingness: 9,
};

void test('social protection bounds actual initial, repair and model-fallback dispatches offline', async () => {
  for (const platform of ['x', 'bluesky'] as const) {
    const args: Parameters<SocialPostEditor['editOutcome']> = [
      topic,
      [{ ...candidate, platform }],
      5,
      'edition',
      [],
      [{ title: 'Selected', summary: 'Current evidence 日' }],
    ];
    const before = structuredClone(args);
    const bound = await protectedSocialObligations({ sonnet, haiku, args });
    assert.equal(bound.requests.length, 4);
    assert.deepEqual(
      bound.requests.map((r) => r.model.id),
      ['sonnet', 'sonnet', 'haiku', 'haiku'],
    );
    for (const text of ['invalid JSON', '{}']) {
      const actual: LlmRequest[] = [];
      let holds = 0;
      const llm = new BudgetedLlm(
        {
          complete: async (request) => {
            actual.push(structuredClone(request));
            return {
              text,
              usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
            };
          },
        },
        {
          reserve: async () => String(++holds),
          cached: async () => undefined,
          settle: async () => {},
          fail: async () => {},
          cache: async () => {},
        },
      );
      const outcome = await new SocialPostEditor(
        llm,
        sonnet,
        haiku,
      ).editOutcome(...args);
      assert.equal(outcome.status, 'failed');
      assert.equal(actual.length, 4);
      for (let i = 0; i < actual.length; i++) {
        const supplied = bound.requests[i];
        assert.deepEqual({ ...actual[i], prompt: supplied.prompt }, supplied);
        assert.ok(
          Buffer.byteLength(actual[i].prompt) <=
            Buffer.byteLength(supplied.prompt),
        );
        if (i % 2 === 0) assert.equal(actual[i].prompt, supplied.prompt);
      }
      const budget = (requests: LlmRequest[]) =>
        developingEditionBudget({
          now: new Date('2026-11-30T00:00:00Z'),
          totals: { today: 0, month: 0 },
          caps: { monthly: 20000000, dailyMax: 650000 },
          modelToday: {},
          protectedMicros: 0,
          protectedModelMicros: {},
          requests,
        });
      assert.ok(
        budget(bound.requests).featureMicros >= budget(actual).featureMicros,
      );
      assert.ok(
        budget(bound.requests).featureMicros >
          budget([bound.requests[0]]).featureMicros,
      );
    }
    assert.deepEqual(args, before);
    assert.deepEqual(
      (
        await protectedSocialObligations({
          sonnet,
          haiku,
          args: [topic, [], 5, 'edition'],
        })
      ).requests,
      [],
    );
  }
});

void test('maximum fixed feedback covers schema combinations and factual-support fields', () => {
  const bound = Buffer.byteLength(maximumValidationRepairFeedback());
  const codes = [
    'unsupported-social-date',
    'invalid-selection',
    'invalid-triage-coverage',
    'invalid-social-selection',
    'unsupported-absence',
  ] as const;
  for (const code of codes)
    for (const field of [
      'headline',
      'summary',
      'whyItMatters',
      'rationale',
      'brief',
    ] as const)
      assert.ok(
        Buffer.byteLength(new LlmValidationFailure(code, field).feedback) <=
          bound,
      );
  const categories = [
    'invalid_type',
    'too_big',
    'too_small',
    'unrecognized_keys',
    'invalid_value',
  ];
  for (let mask = 0; mask < 32; mask++)
    assert.ok(
      Buffer.byteLength(
        schemaRepairFeedback(
          categories
            .filter((_, i) => mask & (1 << i))
            .map((code) => ({ code })),
        ),
      ) <= bound,
    );
});

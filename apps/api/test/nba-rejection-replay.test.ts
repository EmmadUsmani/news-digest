import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { replayNbaRejections } from '../scripts/replay-nba-rejections';
import {
  type EditorialResult,
  ShortlistEditor,
} from '../src/modules/curation/application/editor';
import type {
  TriageCandidate,
  TriageTopic,
} from '../src/modules/curation/application/triage';
import type { ModelPrice } from '../src/modules/curation/domain/llm.port';

void test('saved Sonnet selection excluding unresolved Curry validates with unchanged Reaves prose', async () => {
  const fixture = JSON.parse(
    readFileSync(
      join(__dirname, 'fixtures/llm/nba-2026-11-12-rejected.json'),
      'utf8',
    ),
  ) as {
    entries: Array<{
      input: {
        topic: TriageTopic;
        candidates: TriageCandidate[];
        budget: number;
      };
      output: Omit<EditorialResult, 'model'>;
      model: ModelPrice;
    }>;
  };
  const { input, output, model } = fixture.entries[0];
  // This isolation probe removes one story and its brief bullet. It changes
  // none of the retained model prose and is not a complete-edition replay.
  const isolated = {
    stories: output.stories.filter((s) => !s.summary.includes('Stephen Curry')),
    brief: output.brief.slice(1),
  };
  assert.equal(isolated.stories.length, 4);
  assert.ok(
    isolated.stories.some((s) => s.summary.includes('No update on AR')),
  );
  let calls = 0;
  const editor = new ShortlistEditor(
    {
      async json(_request, validate) {
        calls++;
        return await Promise.resolve(validate(isolated));
      },
    },
    model,
    model,
  );
  const result = await editor.edit(
    input.topic,
    input.candidates,
    input.budget,
    'offline',
  );
  assert.deepEqual(result, { ...isolated, model: model.id });
  assert.equal(calls, 1);
});

void test('Nov 12 recorded NBA outputs replay through production validation without provider access', async () => {
  const replay = await replayNbaRejections();
  assert.equal(replay.editionId, 'b1be5a12-2972-4eeb-9bff-82cbb10c1b07');
  assert.deepEqual(
    replay.results.map((r) => [r.model, r.attempt, r.validated, r.failure]),
    [
      [
        'claude-sonnet-5-5',
        'initial',
        false,
        { category: 'unsupported-absence', field: 'brief' },
      ],
      [
        'claude-sonnet-5-5',
        'repair',
        false,
        { category: 'unsupported-absence', field: 'summary' },
      ],
      [
        'claude-haiku-5-5',
        'initial',
        false,
        { category: 'invalid-selection', field: undefined },
      ],
      ['claude-haiku-5-5', 'repair', true, null],
    ],
  );
  // Pin the additional failures that a Curry-summary-only fix would conceal.
  assert.deepEqual(
    replay.results.map((r) => r.absenceFailures.map((f) => f.field)),
    [['brief'], ['summary', 'brief'], [], []],
  );
});

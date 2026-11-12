import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { assertAbsenceSupport } from '../src/modules/curation/application/absence-support';
import { LlmValidationFailure } from '../src/modules/curation/application/validation-failure';

// Counterfactuals derived from the recorded production inputs, not provider
// outputs. A supported-paraphrase fix must continue rejecting these changes.
const fixture = JSON.parse(
  readFileSync(
    join(__dirname, 'fixtures/llm/nba-2026-11-12-rejected.json'),
    'utf8',
  ),
) as {
  entries: Array<{
    input: { candidates: Array<{ title: string; excerpt?: string }> };
    output: { stories: Array<{ summary: string }> };
  }>;
};
const candidates = fixture.entries[0].input.candidates;
const evidence = (title: string) => {
  const candidate = candidates.find((c) => c.title.includes(title));
  assert.ok(candidate, title);
  return [
    candidate.title.slice(0, 300),
    candidate.excerpt?.slice(0, 600) ?? '',
  ];
};
const curry = evidence('Concern Is High');
const reaves = evidence('X-Rays Return Negative');
const reavesSummary = fixture.entries[0].output.stories.find((story) =>
  story.summary.includes('No update on AR'),
)!.summary;

void test('recorded Reaves summary keeps the complete quote and supplied coach attribution', () => {
  assert.doesNotThrow(() =>
    assertAbsenceSupport(reavesSummary, reaves, 'summary', true),
  );
  // The equivalence is restricted to the existing NBA-summary opt-in.
  assert.throws(() => assertAbsenceSupport(reavesSummary, reaves, 'summary'));
  assert.throws(() => assertAbsenceSupport(reavesSummary, reaves, 'brief'));
});

void test('attributed quote rewrites reject changes to speaker, quote, scope and evidence', () => {
  const cases: Array<[string, string[]]> = [
    [reavesSummary.replace('JJ Redick', 'Steve Kerr'), reaves],
    [reavesSummary.replace('JJ Redick', 'Mike Redick'), reaves],
    [reavesSummary.replace('tomorrow', 'next month'), reaves],
    [reavesSummary.replace(" until we'll have imaging tomorrow", ''), reaves],
    [reavesSummary.replace('returned negative', 'have no injury'), reaves],
    [reavesSummary.replace('tomorrow.', 'tomorrow?'), reaves],
    [reavesSummary, curry],
    [reavesSummary, [reaves[1].replace('Redick said.', 'Kerr said.')]],
    [reavesSummary, [reaves[1].replace('Coach JJ Redick', 'Coach Steve Kerr')]],
    [
      reavesSummary,
      [reaves[1].replace('Redick said.', 'Redick said, according to rumors.')],
    ],
    // A coach's full name in a different evidence item cannot resolve a quote.
    [reavesSummary, reaves[1].split(/(?=\"No update)/)],
    [`${reavesSummary} No further imaging is planned.`, reaves],
  ];
  for (const [claim, inputs] of cases)
    assert.throws(
      () => assertAbsenceSupport(claim, inputs, 'summary', true),
      (error: unknown) =>
        error instanceof LlmValidationFailure &&
        error.code === 'unsupported-absence',
      claim,
    );
});

void test('NBA correction must preserve supported source sentences in summaries and briefs', () => {
  for (const field of ['summary', 'brief'] as const)
    for (const inputs of [curry, reaves])
      assert.doesNotThrow(() =>
        assertAbsenceSupport(inputs[1], inputs, field, field === 'summary'),
      );
});

void test('NBA correction must reject altered duration, attribution, certainty and injury scope', () => {
  const cases: Array<[string, string[]]> = [
    [
      'The Warriors are bracing to be without Stephen Curry for the rest of the season, writes Nick Friedell of The Athletic.',
      curry,
    ],
    [
      'The Warriors are bracing to be without Stephen Curry for at least a few months, writes Nick Friedell of The Athletic.',
      curry,
    ],
    [
      'The Warriors will be without Stephen Curry for at least a few games, writes Nick Friedell of The Athletic.',
      curry,
    ],
    [
      'The Warriors are bracing to be without Stephen Curry for at least a few games, coach Steve Kerr confirmed.',
      curry,
    ],
    [
      'The Warriors are bracing to be without Austin Reaves for at least a few games, writes Nick Friedell of The Athletic.',
      curry,
    ],
    ['Stephen Curry has no return timeline.', curry],
    [
      'Coach Steve Kerr was not certain whether Curry would ever play again.',
      curry,
    ],
    [
      'Coach Steve Kerr said, "No update on AR until we\'ll have imaging tomorrow."',
      reaves,
    ],
    ['Coach JJ Redick said, "No update on AR until next month."', reaves],
    [
      'Coach JJ Redick said there is no Achilles injury and no heel injury.',
      reaves,
    ],
    ['No update on AR.', reaves],
    [
      'Coach JJ Redick said, "No update on AR until we\'ll have imaging tomorrow."',
      curry,
    ],
  ];
  for (const field of ['summary', 'brief'] as const)
    for (const [claim, inputs] of cases)
      assert.throws(
        () => assertAbsenceSupport(claim, inputs, field, field === 'summary'),
        (error: unknown) =>
          error instanceof LlmValidationFailure &&
          error.code === 'unsupported-absence' &&
          error.field === field,
        `${field}: ${claim}`,
      );
});

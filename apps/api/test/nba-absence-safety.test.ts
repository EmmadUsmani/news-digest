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
    output: { stories: Array<{ summary: string }>; brief: string[] };
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

void test('attributed absence resolves the player only through the matching preceding departure', () => {
  const summary = fixture.entries[3].output.stories.find((s) =>
    s.summary.includes('Stephen Curry'),
  )!.summary;
  assert.doesNotThrow(() =>
    assertAbsenceSupport(summary, curry, 'summary', true),
  );
  assert.throws(() => assertAbsenceSupport(summary, curry, 'brief'));
  const mutations = [
    summary.replace('few games', 'few months'),
    summary.replace('are bracing to be', 'will be'),
    summary.replace('Nick Friedell', 'Steve Kerr'),
    summary.replace('The Athletic', 'ESPN'),
    summary.replace('The Warriors', 'The Lakers'),
    summary.replace('Stephen Curry', 'Austin Reaves'),
    summary.replace('right abdominal', 'left abdominal'),
    summary.replace('Houston', 'Boston'),
    summary.split('. ').slice(1).join('. '),
    summary.replace(
      '. The Warriors',
      '. Another player left the game. The Warriors',
    ),
    summary.replace(', according to Nick Friedell of The Athletic', ''),
    summary.replace('few games,', 'few games without a return timeline,'),
  ];
  for (const claim of mutations)
    assert.throws(
      () => assertAbsenceSupport(claim, curry, 'summary', true),
      claim,
    );
  assert.throws(() => assertAbsenceSupport(summary, reaves, 'summary', true));
  // Names are evidence-derived, not a player-specific exemption.
  const renamed = (value: string) =>
    value.replaceAll('Stephen Curry', 'Example Player');
  assert.doesNotThrow(() =>
    assertAbsenceSupport(renamed(summary), curry.map(renamed), 'summary', true),
  );
});

void test('combined attributed absence preserves the complete report and resolves its surname', () => {
  const summary = fixture.entries[2].output.stories.find((s) =>
    s.summary.includes('bracing'),
  )!.summary;
  assert.doesNotThrow(() =>
    assertAbsenceSupport(summary, curry, 'summary', true),
  );
  assert.doesNotThrow(() =>
    assertAbsenceSupport(
      summary.replace(/Curry/g, 'Example'),
      curry.map((input) => input.replace(/Curry/g, 'Example')),
      'summary',
      true,
    ),
  );
  const firstSentence =
    fixture.entries[0].output.stories
      .find((s) => s.summary.includes('Stephen Curry'))!
      .summary.split('. ')[0] + '.';
  assert.doesNotThrow(() =>
    assertAbsenceSupport(firstSentence, curry, 'summary', true),
  );
  for (const claim of [
    summary.replace('few games', 'few months'),
    summary.replace('are bracing to be', 'will be'),
    summary.replace('Nick Friedell', 'Steve Kerr'),
    summary.replace('The Athletic', 'ESPN'),
    summary.replace('the Warriors', 'the Lakers'),
    summary.replace('Curry left', 'Reaves left'),
    summary.replace('right abdominal', 'left abdominal'),
    summary.replace('Houston', 'Boston'),
    summary.replace(', according to Nick Friedell of The Athletic', ''),
    summary.replace('few games,', 'few games without a return timeline,'),
  ])
    assert.throws(
      () => assertAbsenceSupport(claim, curry, 'summary', true),
      claim,
    );
  assert.throws(() => assertAbsenceSupport(summary, reaves, 'summary', true));
  assert.throws(() => assertAbsenceSupport(summary, curry, 'brief'));
  assert.throws(() => assertAbsenceSupport(summary, curry, 'summary'));
});

void test('saved uncertainty sentence retains attribution and both uncertainty dimensions', () => {
  const summary = fixture.entries[0].output.stories.find((story) =>
    story.summary.includes('Stephen Curry'),
  )!.summary;
  assert.doesNotThrow(() =>
    assertAbsenceSupport(summary, curry, 'summary', true),
  );
  for (const claim of [
    summary.replace('Steve Kerr', 'JJ Redick'),
    summary.replace('Steve Kerr', 'Mike Kerr'),
    summary.replace(
      'what caused the injury or exactly when it occurred',
      'what caused the injury',
    ),
    summary.replace(
      'what caused the injury or exactly when it occurred',
      'exactly when it occurred',
    ),
    summary + ' No imaging is planned.',
  ]) {
    assert.throws(() => assertAbsenceSupport(claim, curry, 'summary', true));
  }
  assert.throws(() => assertAbsenceSupport(summary, reaves, 'summary', true));
  assert.throws(() => assertAbsenceSupport(summary, curry, 'brief'));
  assert.throws(() => assertAbsenceSupport(summary, curry, 'summary'));
  for (const suffix of [
    'but no return is expected',
    'but the cause remains unknown',
    'although the report is unconfirmed',
  ])
    assert.throws(() =>
      assertAbsenceSupport(
        summary,
        [curry[1].replace(/but Curry went.*$/, suffix)],
        'summary',
        true,
      ),
    );
});

void test('NBA brief preserves the complete attributed departure and expected absence', () => {
  const brief = fixture.entries[3].output.brief[0];
  assert.doesNotThrow(() => assertAbsenceSupport(brief, curry, 'brief', true));
  assert.throws(() => assertAbsenceSupport(brief, curry, 'brief'));
  assert.throws(() => assertAbsenceSupport(brief, curry, 'summary', true));
  for (const changed of [
    brief.replace('few games', 'few months'),
    brief.replace('is bracing to be', 'will be'),
    brief.replace('Stephen Curry', 'Austin Reaves'),
    brief.replace('Houston', 'Boston'),
    brief.replace('right abdominal', 'left abdominal'),
    brief.replace('Nick Friedell', 'Steve Kerr'),
    brief.replace('The Athletic', 'ESPN'),
    brief.replace('Golden State', 'Los Angeles'),
    brief.replace("Warriors'", "Lakers'"),
    brief.replace(", according to The Athletic's Nick Friedell", ''),
    brief.replace('few games,', 'few games without a return timeline,'),
    brief + ' No further tests are planned.',
  ])
    assert.throws(
      () => assertAbsenceSupport(changed, curry, 'brief', true),
      changed,
    );
  assert.throws(() => assertAbsenceSupport(brief, reaves, 'brief', true));
  const rename = (text: string) =>
    text.replaceAll('Stephen Curry', 'Example Player');
  assert.doesNotThrow(() =>
    assertAbsenceSupport(rename(brief), curry.map(rename), 'brief', true),
  );
});

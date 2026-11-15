import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assertAbsenceSupport } from '../src/modules/curation/application/absence-support';
import { LlmValidationFailure } from '../src/modules/curation/application/validation-failure';

void test('absence support preserves attribution, token boundaries and trailing scope', () => {
  for (const evidence of [
    'The ministry claims no civilians were injured.',
    'According to officials, no civilians were injured.',
    'No civilians were injured, according to the ministry.',
    'No civilians were injured in the northern district.',
    'No civilians were injured if the preliminary report is accurate.',
    'Officials dispute the claim that no civilians were injured.',
    'Unofficially, no civilians were injured.',
  ]) {
    assert.throws(
      () => assertAbsenceSupport('No civilians were injured.', [evidence]),
      LlmValidationFailure,
      evidence,
    );
    assert.doesNotThrow(() => assertAbsenceSupport(evidence, [evidence]));
  }
});

void test('absence support accepts complete sentences within multi-sentence inputs and separate evidence', () => {
  const claim = 'The ministry says no civilians were injured.';
  for (const evidence of [
    [claim],
    [`An investigation continues. ${claim} Officials will report tomorrow.`],
    ['An investigation continues.', claim],
    [`An investigation continues.\n${claim}`],
    ['  THE MINISTRY says  no civilians were injured!  '],
  ])
    assert.doesNotThrow(() => assertAbsenceSupport(claim, evidence));
  assert.throws(
    () =>
      assertAbsenceSupport(claim, [
        'The ministry says',
        'no civilians were injured.',
      ]),
    LlmValidationFailure,
  );
});

void test('numeric No. ranks are not absence claims, but negatives retain full sentence scope', () => {
  for (const text of [
    'The No. 1 prospect leads the rankings.',
    'He moves to no. 12 in the draft.',
    'NO. 3 rises after the game.',
  ])
    assert.doesNotThrow(() => assertAbsenceSupport(text, []));
  for (const claim of [
    'The No. 1 prospect has not signed.',
    'No. 1 is unknown.',
    'No signing was announced.',
    'No. There is a signing.',
  ])
    assert.throws(() => assertAbsenceSupport(claim, []), LlmValidationFailure);
  const evidence = 'The No. 1 prospect has not signed, according to his agent.';
  assert.doesNotThrow(() => assertAbsenceSupport(evidence, [evidence]));
  assert.throws(
    () =>
      assertAbsenceSupport(
        '1 prospect has not signed, according to his agent.',
        [evidence],
      ),
    LlmValidationFailure,
  );
  assert.throws(
    () =>
      assertAbsenceSupport('The No. 1 prospect has not signed.', [evidence]),
    LlmValidationFailure,
  );
});

// Saved Nov 15 World summit source clause and both Sonnet warning sentences.
const summitWarningEvidence =
  'Australia has endorsed this week’s historic summit between Donald Trump, Xi Jinping and Vladimir Putin in China, even as European leaders warn that the US president must not make major concessions over the war in Ukraine.';

void test('saved World warning can stand alone with complete attribution and scope', () => {
  assert.doesNotThrow(() =>
    assertAbsenceSupport(
      'Prime Minister Anthony Albanese said, \"We think dialogue is a good thing.\" European leaders warn that the US president must not make major concessions over the war in Ukraine.',
      [summitWarningEvidence],
      'summary',
    ),
  );
  for (const field of ['summary', 'brief'] as const)
    for (const verb of ['warn that', 'warned that', 'warn', 'warned'])
      assert.doesNotThrow(() =>
        assertAbsenceSupport(
          `European leaders ${verb} the US president must not make major concessions over the war in Ukraine.`,
          [summitWarningEvidence],
          field,
        ),
      );
});

void test('warning extraction refuses changes to attribution, modality, scope and evidence boundaries', () => {
  const claims = [
    'The US president must not make major concessions over the war in Ukraine.',
    'European leaders confirm that the US president will not make major concessions over the war in Ukraine.',
    'European leaders warn that the US president must not make any concessions over the war in Ukraine.',
    'European leaders warn that the US president must not make major concessions.',
    'European leaders warn that the US president must not make major concessions over Ukraine.',
    'European leaders warn that the US president must not make major concessions over the war in Gaza.',
    'American leaders warn that the US president must not make major concessions over the war in Ukraine.',
    'European leaders warn that the US president must not make major concessions over the war in Ukraine, officials confirmed.',
    'Officials said, \"No agreement exists.\" European leaders warn that the US president must not make major concessions over the war in Ukraine.',
    'No agreement exists, and European leaders warn that the US president must not make major concessions over the war in Ukraine.',
  ];
  const supported =
    'European leaders warn that the US president must not make major concessions over the war in Ukraine.';
  for (const field of ['summary', 'brief'] as const) {
    for (const claim of claims)
      assert.throws(
        () => assertAbsenceSupport(claim, [summitWarningEvidence], field),
        LlmValidationFailure,
        claim,
      );
    for (const evidence of [
      summitWarningEvidence.replace(
        'Ukraine.',
        'Ukraine if negotiations begin.',
      ),
      summitWarningEvidence.replace('warn that', 'deny that'),
      summitWarningEvidence.replace(
        'European leaders',
        'Some European leaders',
      ),
      summitWarningEvidence.replace('has endorsed', 'has not endorsed'),
    ])
      assert.throws(
        () => assertAbsenceSupport(supported, [evidence], field),
        LlmValidationFailure,
        evidence,
      );
    assert.throws(
      () =>
        assertAbsenceSupport(
          supported,
          [
            'Australia endorsed the summit, even as European leaders warn that',
            'the US president must not make major concessions over the war in Ukraine.',
          ],
          field,
        ),
      LlmValidationFailure,
    );
  }
  for (const field of ['headline', 'whyItMatters', 'rationale'] as const)
    assert.throws(
      () => assertAbsenceSupport(supported, [summitWarningEvidence], field),
      LlmValidationFailure,
    );
});

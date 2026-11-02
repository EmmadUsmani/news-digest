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

// Offline coverage audit of actual recorded output, never a production rate.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { z } from 'zod';

import { assertAbsenceSupport } from '../src/modules/curation/application/absence-support';
import { LlmValidationFailure } from '../src/modules/curation/application/validation-failure';
import { evaluateEditorialWindow } from './evaluate-editorial';

const fields = ['headline', 'summary', 'whyItMatters', 'rationale'] as const;
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const reviewSchema = z
  .object({
    snapshot: z.literal('editorial-tech-2026-11-01-v4.json'),
    snapshotSha256: z.string().regex(/^[a-f0-9]{64}$/),
    review: z.string().min(1),
    scope: z.string().min(1),
    annotations: z.array(
      z
        .object({
          storyId: z.string().uuid(),
          field: z.enum(fields),
          claimSha256: z.string().regex(/^[a-f0-9]{64}$/),
          label: z.enum(['supported', 'interpretation', 'unsupported']),
          reason: z.string().min(1),
        })
        .strict(),
    ),
  })
  .strict();

export function evaluateRecordedSupport() {
  const directory = join(__dirname, '../test/fixtures');
  const review = reviewSchema.parse(
    JSON.parse(
      readFileSync(join(directory, 'support-review-tech-v4.json'), 'utf8'),
    ),
  );
  assert.equal(
    hash(readFileSync(join(directory, review.snapshot), 'utf8')),
    review.snapshotSha256,
    'Reviewed snapshot changed',
  );
  const replay = evaluateEditorialWindow('tech', 'v4');
  const keys = review.annotations.map((a) => `${a.storyId}:${a.field}`);
  assert.equal(new Set(keys).size, keys.length, 'Duplicate review annotation');
  assert.deepEqual(
    [...keys].sort(),
    replay.selected
      .flatMap((story) => fields.map((field) => `${story.id}:${field}`))
      .sort(),
    'Every selected story field must be reviewed exactly once',
  );
  const cases = review.annotations.map((annotation) => {
    const story = replay.selected.find(
      (entry) => entry.id === annotation.storyId,
    )!;
    const claim = story[annotation.field];
    assert.equal(hash(claim), annotation.claimSha256, 'Reviewed claim changed');
    const inputs = replay.evidenceInputs.find(
      (entry) => entry.storyId === story.id,
    )!;
    assert.ok(
      inputs.recorded && inputs.candidates.length > 0,
      'Review requires recorded citations',
    );
    const evidence = inputs.candidates.flatMap((candidate) => [
      candidate.title,
      candidate.excerpt ?? '',
    ]);
    let accepted = true;
    try {
      assertAbsenceSupport(claim, evidence);
    } catch (error) {
      if (!(error instanceof LlmValidationFailure)) throw error;
      accepted = false;
    }
    return { ...annotation, claim, evidence: inputs.candidates, accepted };
  });
  return {
    snapshot: review.snapshot,
    review: review.review,
    scope: review.scope,
    caveat:
      'Field-level provisional judgments, not clause-level independent labels, truth verification or production error rates. Interpretation is reported separately and excluded from support/rejection counts. No briefs or rejected responses are audited.',
    counts: {
      fields: cases.length,
      supported: cases.filter((entry) => entry.label === 'supported').length,
      interpretation: cases.filter((entry) => entry.label === 'interpretation')
        .length,
      unsupported: cases.filter((entry) => entry.label === 'unsupported')
        .length,
    },
    falseRejections: cases
      .filter((entry) => entry.label === 'supported' && !entry.accepted)
      .map((entry) => `${entry.storyId}:${entry.field}`),
    unsupportedAccepted: cases
      .filter((entry) => entry.label === 'unsupported' && entry.accepted)
      .map((entry) => `${entry.storyId}:${entry.field}`),
    cases,
  };
}
if (require.main === module)
  console.log(JSON.stringify(evaluateRecordedSupport(), null, 2));

// Fixed application-owned repair hints. Never interpolate model/source text.
const feedback = {
  'invalid-selection': '',
  'invalid-triage-coverage':
    '\nThe previous response failed the triage coverage check. Return the complete corrected JSON with an items array containing EVERY batch-local candidate id exactly once. Use id, never originalId; omit no candidates and invent no IDs. Score unrelated candidates too, using low relevance instead of leaving them out.',
  'invalid-social-selection':
    '\nThe previous response failed the post-selection check. Return the complete corrected JSON with a posts array. Use only IDs from candidates, each at most once, and return at most the supplied budget. Do not return IDs from alreadySelected or original IDs replaced by candidate aliases. Fewer posts or an empty array are acceptable; do not pad.',
  'unsupported-absence':
    '\nThe previous response failed the absence-support check. Review ALL headlines, summaries, significance, rationales and brief bullets. Remove sentences containing not, never, no, without, unconfirmed, unverified, unavailable, unknown or negative contractions unless the whole sentence repeats cited supplied text verbatim. Return the complete corrected JSON; shorter supported text is acceptable.',
} as const;

// Select fixed text only; even malformed runtime labels cannot enter a prompt.
const fieldFeedback = new Map<string, string>([
  [
    'headline',
    '\nThe rejected field was headline. Rewrite headlines using supported positive facts.',
  ],
  [
    'summary',
    '\nThe rejected field was summary. Rewrite summaries using supported positive facts.',
  ],
  [
    'whyItMatters',
    '\nThe rejected field was whyItMatters. Explain significance using supplied facts without inventing missing information.',
  ],
  [
    'rationale',
    '\nThe rejected field was rationale. Explain selection using supplied facts without claims about absent information.',
  ],
  [
    'brief',
    '\nThe rejected field was brief. Rewrite brief bullets using supported positive facts from selected stories.',
  ],
]);

export type ValidationField =
  'headline' | 'summary' | 'whyItMatters' | 'rationale' | 'brief';
export type AbsenceMarker =
  'negative-word' | 'negative-contraction' | 'absence-phrase';

export class LlmValidationFailure extends Error {
  readonly feedback: string;
  constructor(
    readonly code: keyof typeof feedback,
    readonly field?: ValidationField,
    readonly absenceMarker?: AbsenceMarker,
  ) {
    super(code);
    this.feedback =
      feedback[code] +
      (code === 'unsupported-absence'
        ? (fieldFeedback.get(field ?? '') ?? '')
        : '');
  }
}

// Closed categories only: never retain exception messages, JSON paths, IDs or text.
export type ValidationDiagnostic = {
  field?: ValidationField;
  absenceMarker?: AbsenceMarker;
  attempt: 'initial' | 'repair' | 'cache';
  category:
    | 'invalid-json'
    | 'invalid-schema'
    | 'invalid-selection'
    | 'invalid-social-selection'
    | 'invalid-triage-coverage'
    | 'unsupported-absence'
    | 'validator-error';
};

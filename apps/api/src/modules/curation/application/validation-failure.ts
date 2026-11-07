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
const schemaIssueCodes = new Set([
  'invalid_type',
  'too_big',
  'too_small',
  'invalid_format',
  'not_multiple_of',
  'unrecognized_keys',
  'invalid_union',
  'invalid_key',
  'invalid_element',
  'invalid_value',
  'custom',
]);

// Zod issue messages, paths, expected values and custom metadata can contain
// source/model text. Project only a bounded set of library-owned categories.
export function schemaIssueCategories(
  issues: readonly { code: string }[],
): string[] {
  return [
    ...new Set(
      issues.map(({ code }) => (schemaIssueCodes.has(code) ? code : 'unknown')),
    ),
  ].sort();
}

// Closed hints describe the correction without exposing schema paths or values.
const schemaRepairHints = new Map<string, string>([
  [
    'invalid_type',
    'Use the requested JSON types for every field; include every required field.',
  ],
  ['too_big', 'Respect the stated maximum values and string or array lengths.'],
  [
    'too_small',
    'Meet the stated minimum values and required string or array lengths.',
  ],
  [
    'unrecognized_keys',
    'Remove extra keys; use exactly the requested properties.',
  ],
  [
    'invalid_value',
    'Use only the allowed values specified in the requested schema.',
  ],
]);

export function schemaRepairFeedback(
  issues: readonly { code: string }[],
): string {
  const hints = schemaIssueCategories(issues)
    .map((code) => schemaRepairHints.get(code))
    .filter((hint): hint is string => hint !== undefined);
  return hints.length
    ? '\nThe previous response failed schema validation. ' +
        hints.join(' ') +
        ' Return the complete corrected JSON while preserving all factual-support rules.'
    : '';
}

export type ValidationDiagnostic = {
  field?: ValidationField;
  absenceMarker?: AbsenceMarker;
  schemaIssues?: string[];
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

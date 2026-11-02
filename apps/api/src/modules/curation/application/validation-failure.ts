// Fixed application-owned repair hints. Never interpolate model/source text.
const feedback = {
  'invalid-selection': '',
  'unsupported-absence':
    '\nThe previous response failed the absence-support check. Review ALL headlines, summaries, significance, rationales and brief bullets. Remove sentences containing not, never, no, without, unconfirmed, unverified, unavailable, unknown or negative contractions unless the whole sentence repeats cited supplied text verbatim. Return the complete corrected JSON; shorter supported text is acceptable.',
} as const;

export class LlmValidationFailure extends Error {
  readonly feedback: string;
  constructor(readonly code: keyof typeof feedback) {
    super(code);
    this.feedback = feedback[code];
  }
}

// Closed categories only: never retain exception messages, JSON paths, IDs or text.
export type ValidationDiagnostic = {
  attempt: 'initial' | 'repair' | 'cache';
  category:
    | 'invalid-json'
    | 'invalid-schema'
    | 'invalid-selection'
    | 'unsupported-absence'
    | 'validator-error';
};

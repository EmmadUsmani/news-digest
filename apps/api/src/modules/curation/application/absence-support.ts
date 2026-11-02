import { LlmValidationFailure } from './validation-failure';

// Conservative lexical guard, not entailment or independent fact-checking.
// Require verbatim source support for sentences that assert absence. This can
// reject supported paraphrases; repair should omit them or quote the input.
const absence =
  /\b(?:not|never|no|without|unconfirmed|unverified|unavailable|unknown)\b|\b(?:hasn|haven|isn|aren|wasn|weren|couldn|didn|doesn|don)['’]t\b|\b(?:rather than an? announcement|details remain limited)\b/i;
const normalize = (text: string) =>
  text.toLowerCase().replace(/\s+/g, ' ').trim();

export function assertAbsenceSupport(text: string, evidence: string[]) {
  const inputs = evidence.map(normalize);
  for (const sentence of text.split(/(?<=[.!?])\s+|\n+/)) {
    if (!absence.test(sentence)) continue;
    // Preserve subjects, attribution and qualifiers by requiring the entire
    // sentence, rather than a shared keyword or a short negative fragment.
    const claim = normalize(sentence).replace(/[.!?]$/, '');
    if (!inputs.some((input) => input.includes(claim)))
      throw new LlmValidationFailure('unsupported-absence');
  }
}

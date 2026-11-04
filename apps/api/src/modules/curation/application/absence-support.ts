import {
  LlmValidationFailure,
  type ValidationField,
} from './validation-failure';

// Conservative lexical guard, not entailment or independent fact-checking.
// Require verbatim source support for sentences that assert absence. This can
// reject supported paraphrases; repair should omit them or quote the input.
const absence =
  /\b(?:not|never|no|without|unconfirmed|unverified|unavailable|unknown)\b|\b(?:hasn|haven|isn|aren|wasn|weren|couldn|didn|doesn|don)['’]t\b|\b(?:rather than an? announcement|details remain limited)\b/i;
// Keep the rank abbreviation attached to its number, including in evidence.
const sentences = (text: string) => text.split(/(?<=[.!?])(?<!\bno\.)\s+|\n+/i);
const absenceMatch = (text: string) =>
  absence.exec(text.replace(/\bno\.(?=\s*\d)/gi, 'number'));
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!?]$/, '');

export function assertAbsenceSupport(
  text: string,
  evidence: string[],
  field?: ValidationField,
) {
  const inputs = new Set(evidence.flatMap(sentences).map(normalize));
  for (const sentence of sentences(text)) {
    const match = absenceMatch(sentence);
    if (!match) continue;
    // Preserve subjects, attribution and qualifiers by requiring the entire
    // source sentence on both sides. Substrings can drop attribution prefixes
    // or scope/uncertainty suffixes. Sentence splitting is deliberately simple;
    // this remains a conservative lexical check, not semantic entailment.
    const claim = normalize(sentence);
    if (!inputs.has(claim))
      throw new LlmValidationFailure(
        'unsupported-absence',
        field,
        /['’]/.test(match[0])
          ? 'negative-contraction'
          : match[0].includes(' ')
            ? 'absence-phrase'
            : 'negative-word',
      );
  }
}

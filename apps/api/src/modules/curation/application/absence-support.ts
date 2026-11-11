import {
  LlmValidationFailure,
  type ValidationField,
} from './validation-failure';

// Conservative lexical guard, not entailment or independent fact-checking.
// Require whole-sentence support, with a narrow equivalence for attributed
// availability reports. Other absence paraphrases must be omitted or quoted.
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

// These two forms express the same attributed expectation. Keep the speaker,
// subject, injury, predicate and hedge; only move the injury clause. An optional
// team name on the source's coach title and a discourse marker on the rewrite
// do not change the claim. Never combine fragments from different sentences.
const speaker = String.raw`([\p{L}’'-]+ [\p{L}’'-]+)`;
const expectation = String.raw` said he does not expect `;
const injury = String.raw`(an? (?:[\p{L}-]+ ){1,4}(?:strain|sprain|fracture|contusion|tear))`;
const sourceAvailability = new RegExp(
  String.raw`^(?:[\p{L}’'-]+ )?coach ${speaker}${expectation}${speaker} to miss much time with ${injury}$`,
  'u',
);
const rewrittenAvailability = new RegExp(
  String.raw`^(?:separately reported, )?coach ${speaker}${expectation}${speaker}, who has ${injury}, to miss much time$`,
  'u',
);
const expandExpectation = (sentence: string) =>
  sentence.replace(/\bdoesn['’]t expect\b/g, 'does not expect');

function supportsAvailabilityRewrite(claim: string, evidence: Set<string>) {
  const rewrite = rewrittenAvailability.exec(expandExpectation(claim));
  if (!rewrite) return false;
  for (const sentence of evidence) {
    const source = sourceAvailability.exec(expandExpectation(sentence));
    if (
      source &&
      source.slice(1).every((value, index) => value === rewrite[index + 1])
    )
      return true;
  }
  return false;
}

export function assertAbsenceSupport(
  text: string,
  evidence: string[],
  field?: ValidationField,
  allowAvailabilityRewrite = false,
) {
  const inputs = new Set(evidence.flatMap(sentences).map(normalize));
  for (const sentence of sentences(text)) {
    const match = absenceMatch(sentence);
    if (!match) continue;
    // Match entire sentences, including the structured rewrite. Substrings
    // can drop attribution prefixes or scope and uncertainty suffixes.
    const claim = normalize(sentence);
    if (
      !inputs.has(claim) &&
      !(allowAvailabilityRewrite && supportsAvailabilityRewrite(claim, inputs))
    )
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

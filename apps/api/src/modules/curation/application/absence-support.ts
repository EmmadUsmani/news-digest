import {
  LlmValidationFailure,
  type ValidationField,
} from './validation-failure';

// Conservative lexical guard, not entailment or independent fact-checking.
// Require whole-sentence support, with narrow NBA-summary equivalences for
// attributed availability reports and complete attributed direct quotes.
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

// A complete direct quote can move from a trailing surname attribution to
// the preceding coach's full name. Resolve that surname only in the same
// excerpt, immediately after the full-name attribution. Never accept a quote
// fragment, an unattributed quote, or negative language outside the quote.
function supportsAttributedQuote(claim: string, evidence: string[]) {
  const rewrite = new RegExp(
    String.raw`^coach ${speaker} said ([^"“”]+), adding, ["“]([^"“”]+)\.["”]( [^"“”]+)?$`,
    'u',
  ).exec(claim);
  if (!rewrite || absenceMatch(rewrite[2]) || absenceMatch(rewrite[4] ?? ''))
    return false;
  for (const input of evidence) {
    const parts = sentences(input).map(normalize);
    for (let index = 1; index < parts.length; index++) {
      const attribution = new RegExp(
        String.raw`^coach ${speaker} said\b`,
        'u',
      ).exec(parts[index - 1]);
      const quote = /^["“]([^"“”]+),["”] ([\p{L}’'-]+) said$/u.exec(
        parts[index],
      );
      if (
        attribution?.[1] === rewrite[1] &&
        quote?.[1] === rewrite[3] &&
        quote[2] === rewrite[1].split(' ')[1]
      )
        return true;
    }
  }
  return false;
}

// Resolve “him” only from the immediately preceding departure sentence.
// Match the entire source report, retaining team, duration, reporter and outlet.
// This deliberately does not accept an unattributed or firmer absence claim.
function supportsAttributedAbsence(
  claim: string,
  previous: string | undefined,
  evidence: Set<string>,
) {
  if (!previous) return false;
  const departure = /^([\p{L}’'-]+ [\p{L}’'-]+) left (.+) with (.+)$/u.exec(
    previous,
  );
  const rewrite =
    /^the (.+) are bracing to be without him for (.+), according to (.+) of (.+)$/u.exec(
      claim,
    );
  if (!departure || !rewrite) return false;
  const [, person, event, condition] = departure;
  const [, team, duration, reporter, outlet] = rewrite;
  if (absenceMatch(previous)) return false;
  // The only surface change in the departure clause is game/contest.
  const source = `the ${team} are bracing to be without ${person} for ${duration} after he left ${event.replace(/\bgame\b/g, 'contest')} with ${condition}, writes ${reporter} of ${outlet}`;
  return [...evidence].some(
    (sentence) => sentence.replace(/’/g, "'") === source.replace(/’/g, "'"),
  );
}

export function assertAbsenceSupport(
  text: string,
  evidence: string[],
  field?: ValidationField,
  allowNbaSummaryRewrite = false,
) {
  const inputs = new Set(evidence.flatMap(sentences).map(normalize));
  const parts = sentences(text);
  for (const [index, sentence] of parts.entries()) {
    const match = absenceMatch(sentence);
    if (!match) continue;
    // Match entire sentences, including the structured rewrite. Substrings
    // can drop attribution prefixes or scope and uncertainty suffixes.
    const claim = normalize(sentence);
    if (
      !inputs.has(claim) &&
      !(
        allowNbaSummaryRewrite &&
        (supportsAvailabilityRewrite(claim, inputs) ||
          supportsAttributedQuote(claim, evidence) ||
          supportsAttributedAbsence(
            claim,
            index > 0 ? normalize(parts[index - 1]) : undefined,
            inputs,
          ))
      )
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

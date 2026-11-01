import type { RelevancePolicy } from '@digest/contracts';
import type { Candidate } from './rank';
const normalize = (text: string) =>
  text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
function matches(text: string, phrase: string): boolean {
  const normalized = normalize(phrase);
  return (
    normalized.length > 0 && (' ' + text + ' ').includes(' ' + normalized + ' ')
  );
}
// Headline/excerpt evidence only: outlet membership or URL must not imply relevance.
export function assessRelevance(
  item: Pick<Candidate, 'title' | 'excerpt'>,
  policy: RelevancePolicy,
) {
  const text = normalize(item.title + ' ' + item.excerpt.slice(0, 600));
  const excluded = policy.excludeAny.find((phrase) => matches(text, phrase));
  if (excluded)
    return { eligible: false, reason: 'Excluded topic phrase: ' + excluded };
  const included = policy.includeAny.find((phrase) => matches(text, phrase));
  if (policy.includeAny.length && !included)
    return { eligible: false, reason: 'No required topic phrase found' };
  return {
    eligible: true,
    reason: included
      ? 'Topic phrase: ' + included
      : 'Topic has no required phrase filter',
  };
}

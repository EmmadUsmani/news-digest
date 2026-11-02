import type { RelevancePolicy } from '@digest/contracts';

import { qualityRejection } from './quality';
import { type Candidate, rank } from './rank';
import { assessRelevance } from './relevance';

// Shared by publication and recorded-window evaluation. Labels never enter selection.
export function editorialShortlist(
  candidates: Candidate[],
  scores: { id: string; relevance: number; importance: number }[],
  policy: RelevancePolicy,
  start: Date,
  end: Date,
) {
  const shortlist = scores
    .filter((s) => s.relevance >= 6 && s.importance >= 4)
    .sort(
      (a, b) =>
        b.importance - a.importance ||
        b.relevance - a.relevance ||
        a.id.localeCompare(b.id),
    )
    .flatMap((score) => {
      const candidate = candidates.find((c) => c.id === score.id);
      return candidate &&
        !qualityRejection(candidate) &&
        assessRelevance(candidate, { ...policy, includeAny: [] }).eligible
        ? [candidate]
        : [];
    })
    .slice(0, 10);
  return { shortlist, ranked: rank(shortlist, start, end, 10) };
}

import type { RelevancePolicy } from '@digest/contracts';

import { clusterCandidates, noGrouping } from './cluster';
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
  matches: (a: Candidate, b: Candidate) => boolean = noGrouping,
  articlePoolSize: 10 | 40 = 10,
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
    .slice(0, articlePoolSize);
  return { shortlist, ranked: rank(shortlist, start, end, 10, matches) };
}

// Only call after complete triage. Preserve its importance order if editing fails;
// excerpts remain unedited and no generated summary or brief is claimed.
export function scoredFallback(
  shortlist: Candidate[],
  start: Date,
  end: Date,
  budget: number,
  matches: (a: Candidate, b: Candidate) => boolean = noGrouping,
) {
  return clusterCandidates(shortlist, matches)
    .flatMap((group) => rank(group, start, end, 1, matches))
    .slice(0, budget);
}
